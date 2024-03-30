# vuecli_study

1. lerna init 初始化项目
1. 配置 yarn workspaces
1. 执行 lerna create <子包名> 创建子包
1. 执行 yarn install 安装依赖，同时会把子包软连执至主包，这样任何一个子包可以相互引入
1. 进入到 cli 目录执行 npm link 创建全局软连，即可在全局执行
1. npm root -g 查看全局 npm 包安装路径
1. 子包根据需求安装依赖包 yarn workspace dl-cli-shared-utils add chalk execa

### create 命令工作流

1. 创建项目 creating project in C:/project/hello1
2. 初始化仓库 Initialling git repository
3. 安装插件 Installing Cli plugins. this might take a while...
4. 调用生成器 每个插件都有一个生成器函数，调用它可以产出文件、修改 webpack/eslint 等 配置 Invoking generators...
5. 安装额外额依赖 Installing additional dependencies...
6. Runing completion hooks
7. Generating README.md ... 生成 readme 文件
8. Successfully created project hello1
