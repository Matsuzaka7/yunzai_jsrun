import { exec } from "child_process";
import fs from "fs";

/* 
    - 该版本(v1.0)作为测试版本，并且不做任何更新

    - 在1.0中
      - 将没有任何限制，并且可以导入模块，被恶意使用可能会造成格盘等情况，使用方式与v0.8大致相同，会有略微区别
        - 使用 `## xxx` 运行
      - 并且可以操作 cmd
        - 使用 `#cmd xxx` 运行
    - 如无法承担后果请下载 v0.8版本：https://github.com/Matsuzaka7/yunzai_jsrun/tree/v0.8

    - by 松坂砂糖
*/

const config = {
  timeout: 2000,
  // windowsHide: true,
  windowsVerbatimArguments: true
}
    
export class jsrun extends plugin {
  constructor() {
    super({
      name: 'js运行工具-v1.0',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: "^##(.*)",
          fnc: 'run'
        },
        {
          reg: "^#*cmd(.*)",
          fnc: 'cmd',
          permission: 'master'
        },
      ]
    })
  }

  async run (e) {
    const content = e.message[0].text.split("##")[1]
    const path = "./operation.js";
    await fs.promises.writeFile(path, content)
    await exec(`node ${path}`, config, (err, stdout, stderr) => {
      if (err) {
        e.reply(String(err.message))
      } else {
        e.reply(stdout.substr(0, stdout.length - 1))
      }
      fs.promises.unlink(path, (err) => {})
    })
    return true;
  }

  async cmd (e) {
    const content = e.message[0].text.split("cmd")[1]
    exec(content, { encoding: '' }, (err, stdout, stderr) => {
      const GBK = new TextDecoder("GBK")
      if (err) {
        e.reply(String(err.message))
      } else {
        e.reply(GBK.decode(stdout))
      }
    });
    return true;
  }

}
