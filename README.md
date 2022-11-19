# YunzaiV3 - js运行插件

**仅适配 YunzaiV3**

****

## 关于本插件
该插件**在使用时**可能会有不可预料的风险，请谨慎使用。包括但不限于：云崽崩溃、内存溢出
  - 该插件的作用：
      - 提供js运行的环境，可执行js代码如： 
      - 计算器       100+200
      - 表达式       Math.random() > 0.5 ? '大于0.5' : '小于0.5'
      - 函数执行     [1, 5, 6, 2].reduce((a,b) => a+b, 0)
      - 包括任何可执行的第三方包，如axios.get()
          - 使用axios请先安装依赖: `npm i axios`
          - 并在本js开头导入该包: `import axios from 'axios'`
 - 使用 ## 运行
      - `## 1+2`
      - `## Math.random() > 0.5 ? '大于0.5' : '小于0.5'`
 - by 松坂砂糖

## 安装

#### 方式一：直接下载压缩包 *推荐

下载js后复制到 `Yunzai-Bot/plugins/example` 目录下，无需重启可直接使用(前提是装好依赖）


#### ~~方式二： git进行安装，在Yunzai目录打开git终端，运行~~

```git
// 使用git, 依次执行
git clone --no-checkout https://github.com/Matsuzaka7/yunzai_jsrun.git tmp
mv tmp/.git
rmdir tmp
git reset --hard HEAD
```

****

##  免责声明

- **使用本插件造成的一切不可预料的后果由插件使用者自己承担**.
- 功能仅限内部交流与小范围使用，请勿将 `Yunzai-Bot` 及本插件用于任何以盈利为目的的场景.


####  联系方式

- QQ：2365999861
