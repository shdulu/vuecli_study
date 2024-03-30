# vuecli_study

1. lerna init 初始化项目
1. 配置 yarn workspaces
1. 执行 lerna create <子包名> 创建子包
1. 执行 yarn install 安装依赖，同时会把子包软连执至主包，这样任何一个子包可以相互引入
1. 进入到 cli 目录执行 npm link 创建全局软连，即可在全局执行
2. npm root -g 查看全局npm包安装路径
1. 子包根据需求安装依赖包 yarn workspace dl-cli-shared-utils add chalk execa