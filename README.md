# YunzaiV3 - 青云阁回复插件

**仅适配 YunzaiV3**

请将 `本插件.js` 文件放置在Yunzai-Bot的 `plugins/example` 目录下，无需重启可直接使用。

****

## 关于本插件
该插件在使用时可能会有不可预料的风险，请谨慎使用。包括但不限于：云崽崩溃，内存占满
  - 该插件的作用：
      - 提供js运行的环境，可执行js代码
      - 如： 
      - 计算器       100+200
      - js表达式运行 Math.random() > 0.5 ? '大于0.5' ： '小于0.5'
      - js函数执行   [1, 5, 6, 2].reduce((a,b) => a+b, 0)
      - 包括任何可执行的第三方包，如axios.get()
          - 使用axios请先下载: npm i axios

## 安装

#### 方式一： git进行安装，在Yunzai目录打开git终端，运行

```git
// 使用github
git clone https://github.com/Matsuzaka7/yunzai_jsrun.git ./plugins/example
```

#### 方式二：直接下载压缩包

下载完毕后直接复制到 Yunzai-Bot的 `plugins/example` 目录下，无需重启可直接使用

****

##  免责声明

- 功能仅限内部交流与小范围使用，请勿将 `Yunzai-Bot` 及 `本插件`用于任何以盈利为目的的场景.
- 使用本插件造成的一切不可预料的后果由 插件使用者自己承担


####  联系方式

- QQ：2365999861
    - by 砂糖
