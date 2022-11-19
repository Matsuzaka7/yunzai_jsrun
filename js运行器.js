import { segment } from "oicq";
// import axios from 'axios'

/*
  jsrun - v0.3
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

  免责声明: 使用本插件造成的一切不可预料的后果由 插件使用者自己承担
    - by 砂糖
*/

// 缓存信息
let _tempRes_ = ''
let _resCount_ = 0

// 设置与上一次的相应间隔 200ms
let _tempTime_ = 0
const resTime = 200

// 重复的话术
const oneAdd1 = '与上一次运行结果一致'

// 限制字符长度
const length = 199

export class example extends plugin {
  constructor() {
    super({
      name: 'js运行工具',
      event: 'message',
      priority: 500,
    })
  }

  //执行方法
  async accept(_e_event114514_) {
      if (Date.now() - _tempTime_ < resTime) return 
      _tempTime_ = Date.now()
      try {
        if (_e_event114514_.message[0].type !== 'text') return
        if (!_e_event114514_.message[0].text.includes('##')) return
        const _text_content_ = _e_event114514_.message[0].text.split("##")[1]
        if (_text_content_ === undefined) return 

        const blacklist = ['this', 'global', 'eval', 'for', 'while', 'import', 'require', 'export', 'setInterval', 
                          'String', 'Promise', 'prototype', '__proto__', 'getPrototypeOf', 'setPrototypeOf',
                          'blacklist', 'plugin', '_e_event114514_', '_tempTime_', '_resCount_', '_tempRes_'
                          ]
        const findlist = blacklist.find(item => _text_content_.toUpperCase().includes(item.toUpperCase()))
        if (findlist) {
          return _e_event114514_.reply('该关键词已禁用：' + findlist)
        }

        let res = await eval(_text_content_);
        if (JSON.stringify(res.data || res) == _tempRes_) throw new Error(oneAdd1)
        if (typeof res !== "object") {
          await _e_event114514_.reply(`${res}`.trim());
        } else {
          const dataType = res.data || res;
          if (JSON.stringify(dataType).length > length) {
               await _e_event114514_.reply(`字符长度超出${length}，进行截取`);
               await _e_event114514_.reply(JSON.stringify(dataType, null, 4).substring(0, length) + '\n...');
          } else {
              await _e_event114514_.reply(JSON.stringify(dataType, null, 4));
          }
        }
        _resCount_ = 0
        _tempRes_ = JSON.stringify(res.data || res)
      } catch(error) {
        if (error.message === oneAdd1) _resCount_++;
        if (_resCount_ <= 1) await _e_event114514_.reply('错误：' + error.message);
      }
    return true;
  }
}

