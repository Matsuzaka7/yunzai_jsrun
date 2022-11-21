import { segment } from "oicq";
import axios from 'axios'
import md5 from "md5"

let _isValve_ = true
let blockState = true
let kaiguan=""
let helpmsg = [
"#js开关：启用/禁用插件","\n",
"#js屏蔽词：切换屏蔽词开关","\n",
"#js帮助：查看本帮助"
]

export class example extends plugin {
  constructor() {
    super({
      name: 'js运行工具',
      event: 'message',
      priority: 500,
      rule: [
        {
          reg: '^#js开关',
          fnc: 'mainstate',
		  permission: 'master'
        },
		{
		  reg: '^#js屏蔽词',
          fnc: 'changeBlock',
		  permission: 'master'
		},
		{
		  reg: '^#js?(帮助|菜单)',
          fnc: 'jshelp'
		}
      ]
    })
  }
  
  async accept(e) {
    try {
      if (!_isValve_) return
	  
      if (e.message[0].type !== 'text') return
      if (!e.message[0].text.includes('##')) return

      const content = e.message[0].text.split("##")[1]
      if (content === undefined) return 
      if (content.trim() === '启用' || content.trim() === '禁用'|| content.trim() === '屏蔽词'|| content.trim() === '开关'|| content.trim() === '帮助') return

      if (blockState){
		const blacklist = ['eval', 'while', "for", 'import', 'require', 'export', 'setInterval', 'Promise']
		const findlist = blacklist.find(item=>content.includes(item))
        if (findlist) {return e.reply('该关键词已禁用：' + findlist)}
	  }

      let res = await eval(content);
      const dataType = (res && res.data) || res;
	  if (typeof dataType==='string') return e.reply(dataType);
      if (dataType === undefined) return await e.reply("该表达式没有返回值： undefined");
      await e.reply(JSON.stringify(dataType, null, 4));

    } catch(error) {
      await e.reply('运行错误：' + error.message);
    }
    return true;
  }

  async mainstate(e) {
    _isValve_ =!_isValve_;
	if(_isValve_){kaiguan="启用"}else{kaiguan="禁用"}
	await e.reply('js运行插件已'+kaiguan)
    return true
  }

  async changeBlock(e) {
    blockState=!blockState;
	if(blockState){kaiguan="启用"}else{kaiguan="禁用"}
	await e.reply('关键词屏蔽已'+kaiguan)
    return true
  }
  
  async jshelp(e) {
    await e.reply(helpmsg);
    return true
  }
}
