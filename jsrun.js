import { segment } from "oicq";
// import axios from 'axios'

/*
  jsrun - v0.6*
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
      - ## 开启
      - ## 关闭

  免责声明: 使用本插件造成的一切不可预料的后果由 插件使用者自己承担
    - by 砂糖
*/

let _isValve_ = true

// 缓存消息
let _tempRes_ = ''
let _resCount_ = 0

// 设置与上一次的相应间隔 200ms
let _tempTime_ = 0
const _resTime_ = 200

// 重复的话术
const _oneTurn_ = '与上一次运行结果一致'

// 限制输入字符长度
const _inputMax_length_ = 150
// 限制输出字符长度
const _outptMAx_length_ = 199

export class example extends plugin {
  constructor() {
    super({
      name: 'js运行工具',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^##( *)开启(.*)$',
          fnc: 'open'
        },
        {
          reg: '^##( *)关闭(.*)$',
          fnc: 'close'
        }
      ]
    })
  }

  accept = async (_e_event_) => {
    try {
      if (!_isValve_) return
      let _failds_img_ = segment.image(`https://xiaobai.klizi.cn/API/ce/paa.php?qq=${_e_event_.user_id}`)
      if (Date.now() - _tempTime_ < _resTime_) return 
      _tempTime_ = Date.now()

      if (_e_event_.message[0].type !== 'text') return
      if (!_e_event_.message[0].text.includes('##')) return

      const _text_content_ = _e_event_.message[0].text.split("##")[1]
      if (_text_content_ === undefined) return 
      if (_text_content_.trim() === '关闭' || _text_content_.trim() === '开启') return
      if (_text_content_.length > _inputMax_length_) return _e_event_.reply(_failds_img_, true)

      const blacklist = [
        '', 'global', 'eval', 'for', 'while', 'import', 'require', 'export', 'setInterval', 
        'fromCharCode', 'raw', 'codePointAt', 'toLowerCase', 'keys', 'values', 'Promise', 'prototype', '__proto__', 'getPrototypeOf', 'setPrototypeOf',
        'blacklist', 'plugin', '_e_event_', '_tempTime_', '_resCount_', '_tempRes_', '_inputMax_length_', '_isValve_', 'Bot'
      ]
      const findlist = blacklist.find(item => _text_content_.toUpperCase().includes(item.toUpperCase()))
      if (findlist) return _e_event_.reply('该关键词已禁用：' + findlist)

      let res = await eval(_text_content_);
      const dataType = (res && res.data) || res;
      if (JSON.stringify(dataType) == _tempRes_) throw new Error(_oneTurn_)
      if (dataType === undefined) return await _e_event_.reply(`该表达式没有返回值： undefined`);
      if (JSON.stringify(dataType).length > _outptMAx_length_) {
           await _e_event_.reply(`字符长度超出${_outptMAx_length_}，进行截取`);
           await _e_event_.reply(JSON.stringify(dataType, null, 4).substring(0, _outptMAx_length_) + '\n...');
      } else {
          await _e_event_.reply(JSON.stringify(dataType, null, 4));
      }

      _resCount_ = 0
      _tempRes_ = JSON.stringify(dataType || res)
    } catch(error) {
      if (error.message === _oneTurn_) _resCount_++;
      if (_resCount_ <= 1) await _e_event_.reply('错误：' + error.message);
    }
    return true;
  }

  open = async (_e_event_) => {
    if (_isValve_ === true) return
    if (_e_event_.isMaster) {
      _isValve_ = true
      await _e_event_.reply('## 已开启');
    }
    return true
  }

  close = async (_e_event_) => {
    if (_isValve_ === false) return
    if (_e_event_.isMaster) {
      _isValve_ = false
      await _e_event_.reply('## 已关闭');
    }
    return true
  }
}

