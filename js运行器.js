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
let tempRes = ''
let resCount = 0

// 设置与上一次的相应间隔 200ms
let tempTime = 0
let resTime = 200

// 重复的话术
const oneAdd1 = '与上一次运行结果一致'

export class example extends plugin {
  constructor() {
    super({
      name: 'js运行工具',
      event: 'message',
      priority: 500,
    })
  }

  //执行方法
  async accept(e) {
      if (Date.now() - tempTime < resTime) return 
      tempTime = Date.now()
      try {
        if (e.message[0].type !== 'text') return
        if (!e.message[0].text.includes('##')) return
        const content = e.message[0].text.split("##")[1]
        if (content === undefined) return 

        const blacklist = ['eval', 'for', 'while', 'import', 'require', 'export', 'setInterval', 'Promise']
        const findlist = blacklist.find(item => content.includes(item))
        if (findlist) {
          return e.reply('该关键词已禁用：' + findlist)
        }

        let res = await eval(content);
        if (JSON.stringify(res.data || res) == tempRes) throw new Error(oneAdd1)
        const length = 199
        if (typeof res !== "object") {
          await e.reply(`${res}`.trim());
        } else {
          const dataType = res.data || res;
          if (JSON.stringify(dataType).length > length) {
               await e.reply(`字符长度超出${length}，进行截取`);
               if (res.data) return 
               await e.reply(JSON.stringify(dataType, null, 4).substring(0, length) + '\n...');
          } else {
              await e.reply(JSON.stringify(dataType, null, 4));
          }
        }
        resCount = 0
        tempRes = JSON.stringify(res.data || res)
      } catch(error) {
        if (error.message === oneAdd1) resCount++;
        if (resCount <= 1) await e.reply('错误：' + error.message);
      }
    return true;
  }
}
