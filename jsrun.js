import { segment } from "oicq";
// import axios from 'axios'

/*
  jsrun - v0.7*
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

let _isValve_ = true

// 缓存消息
let _tempRes_ = ''
let _resCount_ = 0

// 设置与上一次的响应间隔 200ms
let _tempTime_ = 0
let _resTime_ = 200

// 限制输入字符长度
let _inputMax_length_ = 150
// 限制输出字符长度
let _outptMax_length_ = 199

// 回复消息是否引用执行消息
let _message_at_ = false

// 重复的话术
const _oneTurn_ = '与上一次运行结果一致'

export class example extends plugin {
  constructor() {
    super({
      name: 'js运行工具',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: '^##( *)开启|关闭$',
          fnc: 'setting',
          permiseeion: 'master'
        },
        {
          reg: '^##( *)设置输入字数|设置输出字数|设置响应间隔([0-9]*)$',
          fnc: 'setting',
          permiseeion: 'master'
        },
        {
          reg: '^##( *)设置引用回复(开启|关闭)$',
          fnc: 'setting',
          permiseeion: 'master'
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
      if (!_isValve_) return
      let _failds_img_ = segment.image(`https://xiaobai.klizi.cn/API/ce/paa.php?qq=${_e_event_.user_id}`)
      if (Date.now() - _tempTime_ < _resTime_) return 
      _tempTime_ = Date.now()

      if (_e_event_.message[0].type !== 'text') return
      if (!_e_event_.message[0].text.includes('##')) return

      const _text_content_ = _e_event_.message[0].text.split("##")[1]
      if (_text_content_ === undefined) return 
      if (_text_content_.length > _inputMax_length_) return _e_event_.reply(_failds_img_, _message_at_)

      const settinglist = ['开启', '关闭', '帮助', '设置输入字数', '设置输出字数' ,'设置响应间隔', '设置引用回复']
      if (settinglist.find(item => _text_content_.includes(item))) return

      const blacklist = [
        'this', 'global', 'eval', 'for', 'while', 'import', 'require', 'export', 'setInterval', 
        'fromCharCode', 'raw', 'codePointAt', 'toLowerCase', 'keys', 'values', 'Promise', 'prototype', '__proto__', 'getPrototypeOf', 'setPrototypeOf',
        'blacklist', 'settinglist', 'plugin', '_e_event_', '_tempTime_', '_resCount_', '_tempRes_', '_inputMax_length_', '_outptMax_length_', '_isValve_', '_message_at_', 'Bot',
      ]
      const findlist = blacklist.find(item => _text_content_.toUpperCase().includes(item.toUpperCase()))
      if (findlist) return _e_event_.reply('该关键词已禁用：' + findlist, _message_at_)

      let res = await eval(_text_content_);
      const dataType = (res && res.data) || res;
      if (JSON.stringify(dataType) == _tempRes_) throw new Error(_oneTurn_)
      if (dataType === undefined) return await _e_event_.reply(`该表达式没有返回值： undefined`, _message_at_);

      if (JSON.stringify(dataType).length > _outptMax_length_) {
        await _e_event_.reply(`字符长度超出${_outptMax_length_}，进行截取`);
        typeof dataType !== 'object' ? await _e_event_.reply(`${dataType}`.substring(0, _outptMax_length_) + '...', _message_at_) : await _e_event_.reply(JSON.stringify(dataType, null, 4).substring(0, _outptMax_length_) + '...', _message_at_);
      } else {
        typeof dataType !== 'object' ? await _e_event_.reply(`${dataType}`, _message_at_) : await _e_event_.reply(JSON.stringify(dataType, null, 4), _message_at_)
      }

      _resCount_ = 0
      _tempRes_ = JSON.stringify(dataType || res)
    } catch(error) {
      if (error.message === _oneTurn_) _resCount_++;
      if (_resCount_ <= 1) await _e_event_.reply('错误：' + error.message, _message_at_);
    }
    return true;
  }

  async setting (_e_event_) {
    const _text_content_ = _e_event_.message[0].text.split("##")[1].trim()
    
    if (_text_content_.includes('设置引用回复')) {
      const flag = _text_content_.split('设置引用回复')[1]
      if (flag.trim() === '开启') {
        _message_at_ = true
      } else if (flag.trim() === '关闭') {
        _message_at_ = false
      }
      await _e_event_.reply(`# 引用回复：已${_message_at_ ? '开启' : '关闭'}`);
    } else if (_text_content_.includes('开启')) {
      if (_isValve_ === true) return _e_event_.reply('# 当前已开启', _message_at_);
      _isValve_ = true
      await _e_event_.reply('# 已开启', _message_at_);
    } else if (_text_content_.includes('关闭')) {
      if (_isValve_ === false) return
      _isValve_ = false
      await _e_event_.reply('# 已关闭', _message_at_);
    } else if (_text_content_.includes('设置输入字数')) {
      if (!_isValve_) return
      const number = _text_content_.split('设置输入字数')[1]
      if (typeof +number !== 'number' || +number < 1) return _e_event_.reply('请输有效的数字', _message_at_);
      _inputMax_length_ = +number
      _e_event_.reply('# 已设置最大输入字数：' + _inputMax_length_, _message_at_);
    } else if (_text_content_.includes('设置输出字数')) {
      if (!_isValve_) return
      const number = _text_content_.split('设置输出字数')[1]
      if (typeof +number !== 'number' || +number < 1) return _e_event_.reply('请输有效的数字', _message_at_);
      _outptMax_length_ = +number
      _e_event_.reply('# 已设置最大输出字数：' + _outptMax_length_, _message_at_);
    } else if (_text_content_.includes('设置响应间隔')) {
      if (!_isValve_) return
      const number = _text_content_.split('设置响应间隔')[1]
      if (typeof +number !== 'number' || +number < 1) return _e_event_.reply('请输有效的数字', _message_at_);
      _resTime_ = +number
      _e_event_.reply('# 已设置响应间隔：' + _resTime_, _message_at_);
    }
    return true;
  }

  async help (_e_event_) {
    let _failds_img_ = segment.image(`http://47.95.112.111:666/JS-Run_v0.7.png`)
    _e_event_.reply(_failds_img_);
    return true
  }
}
