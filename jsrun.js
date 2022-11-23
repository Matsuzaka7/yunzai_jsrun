import { segment } from "oicq";
// import axios from 'axios'

/*
  jsrun - v0.8* 
  该插件在使用时可能会有不可预料的风险，请谨慎使用。包括但不限于：云崽崩溃，内存溢出
  该插件的作用：
      - 提供js运行的环境，可执行js代码
      - 如： 
        - 计算器       100+200
        - js表达式运行 Math.random() > 0.5 ? '大于0.5' ： '小于0.5'
        - js函数执行   [1, 5, 6, 2].reduce((a,b) => a+b, 0)
        - 包括任何可执行的第三方包，如axios.get()
          - 使用axios请先下载: npm i axios
          
  使用本插件：
      - ## 1+1
      - ## Math.random() > 0.5 ? '大于0.5' ： '小于0.5'
      - ## [1, 5, 6, 2].reduce((a,b) => a+b, 0)
      - ## 帮助

  免责声明: 使用本插件造成的一切不可预料的后果由 插件使用者自己承担
    - by 砂糖
*/

const _setting_ = {
  // 程序开关
  _isValve_: true,
  // 屏蔽词开关
  _isShield_: true,
  // 运行结果一致时是否拦截
  _isIntercept_: true,
  // 回复消息是否引用执行消息
  _message_at_: false,
  // 缓存消息
  _tempRes_: '',
  _errCount_: 0,
  // 设置与上一次的响应间隔 200ms
  _tempTime_: 0,
  _resTime_: 200,
  // 限制输入字符长度
  _inputMax_length_: 150,
  // 限制输出字符长度
  _outptMax_length_: 199,
  // 重复的话术
  _oneTurn_: '与上一次运行结果一致'
}

// 请勿修改，如需删除_setting_中的某项配置，请一并将_configObjects_对应的配置删除
const _configObjects_ = [
  { tier: 1, keyTerm: [{key: '_isValve_', value: '开启'}, {key: '_isValve_', value: '关闭'}] },
  { tier: 2, keyTerm: [{key: '_inputMax_length_', value: '输入字数'}, {key: '_outptMax_length_', value: '输出字数'}, {key: '_resTime_', value:'响应间隔'}] },
  { tier: 3, keyTerm: [{key: '_message_at_', value: '引用回复'}, {key: '_isShield_', value: '屏蔽词'}, {key: '_isIntercept_', value:'重复拦截'}] }
]

// 生成正则, 请勿随意修改该函数，如需修改前缀 ##，请使用: valueToRegExp(1, '前缀', '后缀')
const valueToRegExp = (id, startSymbol ,endSymbol) => {
  let list = null
  for (let i = 0; i < _configObjects_.length; i++) {
    let item = _configObjects_[i]
    if (item.tier === id){
      list = item.keyTerm.map(val => val.value)
    } 
  }
  return new RegExp(`${startSymbol || '##( *)'}${list.join("|")}${endSymbol || ''}$`)
}

export class jsrun extends plugin {
  constructor() {
    super({
      name: 'js运行工具',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: valueToRegExp(1),
          fnc: 'setting',
          permission: 'master'
        },
        {
          reg: valueToRegExp(2, '([0-9]*)'),
          fnc: 'setting',
          permission: 'master'
        },
        {
          reg: valueToRegExp(3, '(开启|关闭)'),
          fnc: 'setting',
          permission: 'master'
        },
        {
          reg: '^##( *)(帮助|设置)$',
          fnc: 'help'
        }
      ]
    })
  }

  async accept (_e_event_) {
    try {
      if (!_setting_._isValve_) return
      let _failds_img_ = segment.image(`https://xiaobai.klizi.cn/API/ce/paa.php?qq=${_e_event_.user_id}`)
      if (Date.now() - _setting_._tempTime_ < _setting_._resTime_) return 
      _setting_._tempTime_ = Date.now()

      if (_e_event_.message[0].type !== 'text') return
      if (!_e_event_.message[0].text.includes('##')) return

      const _text_content_ = _e_event_.message[0].text.split("##")[1]
      if (_text_content_ === undefined) return 

      const jump = _configObjects_.some(item => item.keyTerm.some(list => _text_content_.includes(list.value)))
      if (jump || _text_content_.includes('帮助') || _text_content_.includes('设置')) return

      if (_text_content_.length > _setting_._inputMax_length_) return _e_event_.reply(_failds_img_, true)

      const blacklist = [
        'this', 'global', 'eval', 'for', 'while', 'import', 'require', 'export', 'setInterval', 
        'fromCharCode', 'raw', 'codePointAt', 'toLowerCase', 'values', 'values', 'Promise', 'prototype', '__proto__', 'getPrototypeOf', 'setPrototypeOf',
        'blacklist', '_setting_list', 'plugin', '_e_event_', '_setting_', '_configObjects_', 'Bot',
      ]
      const findlist = blacklist.find(item => _text_content_.toUpperCase().includes(item.toUpperCase()))
      if (_setting_._isShield_ && findlist) return _e_event_.reply('该关键词已禁用：' + findlist, _setting_._message_at_)

      let res = await eval(_text_content_);
      const dataType = (res && res.data) || res;
      if (_setting_._isIntercept_ && JSON.stringify(dataType) == _setting_._tempRes_) throw new Error(_setting_._oneTurn_);
      if (dataType === undefined) return await _e_event_.reply(`该表达式没有返回值： undefined`, _setting_._message_at_);

      if (JSON.stringify(dataType).length > _setting_._outptMax_length_) {
        await _e_event_.reply(`字符长度超出${_setting_._outptMax_length_}，进行截取`);
        typeof dataType !== 'object' ? await _e_event_.reply(`${dataType}`.substring(0, _setting_._outptMax_length_) + '...', _setting_._message_at_) : await _e_event_.reply(JSON.stringify(dataType, null, 4).substring(0, _setting_._resTime_) + '...', _setting_._message_at_);
      } else {
        typeof dataType !== 'object' ? await _e_event_.reply(`${dataType}`, _setting_._message_at_) : await _e_event_.reply(JSON.stringify(dataType, null, 4), _setting_._message_at_)
      }

      _setting_._errCount_ = 0
      _setting_._tempRes_ = JSON.stringify(dataType || res)
    } catch(error) {
      if (error.message === _setting_._oneTurn_) _setting_._errCount_++;
      if (_setting_._errCount_ <= 1) await _e_event_.reply('错误：' + error.message, _setting_._message_at_);
    }
    return true;
  }

  async setting (_e_event_) {
    const _text_content_ = _e_event_.message[0].text.split("##")[1].trim()
    _configObjects_.forEach(item => {
      if (item.tier === 1) {
        if (_text_content_ === item.keyTerm[0].value) {
          if (_setting_[item.keyTerm[0].key] === true) return _e_event_.reply('# 当前已开启', _setting_._message_at_);
          _setting_[item.keyTerm[0].key] = true
          _e_event_.reply('# 已开启', _setting_._message_at_);
        }
        if (_text_content_ === item.keyTerm[1].value) {
          _setting_[item.keyTerm[1].key] = false
          _e_event_.reply('# 已关闭', _setting_._message_at_);
        }
      } else if (item.tier === 2) {
        if (!_setting_._isValve_) return
        item.keyTerm.forEach(keyTermItem => {
          if (_text_content_.includes(keyTermItem.value)) {
            const number = _text_content_.split(keyTermItem.value)[1]
            if (!isNaN(+number) && +number > -1) {
              _setting_[keyTermItem.key] = +number
              _e_event_.reply(`# 已设置${keyTermItem.value}：` + _setting_[keyTermItem.key], _setting_._message_at_);
            } else {
              _e_event_.reply('请输有效的数字', _setting_._message_at_);
            }
          }
        })
      } else if (item.tier === 3) {
        if (!_setting_._isValve_) return
        item.keyTerm.forEach(keyTermItem => {
          if (_text_content_.includes(keyTermItem.value)) {
            const flag = _text_content_.split(keyTermItem.value)[1].trim()
            if (flag === '开启') {
              _setting_[keyTermItem.key] = true
            } else if (flag === '关闭') {
              _setting_[keyTermItem.key] = false
            }
            _e_event_.reply(`# ${keyTermItem.value}：已${_setting_[keyTermItem.key] ? '开启' : '关闭'}`)
          }
        })
      }
    })
    return true;
  }

  async help (_e_event_) {
    let _failds_img_ = segment.image(`http://47.95.112.111:666/JS-Run_v0.8.png`)
    _e_event_.reply(_failds_img_);
    return true
  }
}

