# emp-script-static 项目说明

## 项目概述

**emp-script-static** 是一个 Maven 项目，用于提供 EWA (EasyWeb Application) 项目的静态资源文件。该项目由 [gdxsoft](https://www.gdxsoft.com) 开发，主要包含 JavaScript、CSS、图片等前端静态资源。

- **项目地址**: https://github.com/gdx1231/emp-script-static
- **官方网站**: https://www.gdxsoft.com
- **许可证**: MIT License
- **当前版本**: 1.1.10

## 技术栈

- **构建工具**: Maven (Java 1.8)
- **主要语言**: Java
- **静态资源**: JavaScript, CSS, HTML, 图片等
- **依赖管理**: Maven Central

## 项目结构

```
emp-script-static/
├── src/
│   ├── main/
│   │   ├── java/                    # Java 源代码
│   │   │   └── com/gdxsoft/easyweb/resources/
│   │   │       ├── Resources.java   # 静态资源加载器
│   │   │       ├── Resource.java    # 资源模型类
│   │   │       ├── Servlet.java     # 资源服务 Servlet
│   │   │       ├── MyUtils.java     # 工具类
│   │   │       └── DemoDataOfHsqldb.java
│   │   └── resources/
│   │       └── EmpScriptV2/         # 静态资源目录
│   │           ├── EWA_STYLE/       # EWA 样式和脚本
│   │           │   ├── js/          # JavaScript 文件
│   │           │   ├── css/         # CSS 样式文件
│   │           │   ├── images/      # 图片资源
│   │           │   ├── skins/       # 皮肤主题
│   │           │   ├── app2/        # App2 相关资源
│   │           │   └── vue/         # Vue 相关资源
│   │           ├── third-party/     # 第三方库
│   │           │   ├── jquery/
│   │           │   ├── bootstrap/
│   │           │   ├── font-awesome/
│   │           │   └── vue/
│   │           ├── EWA_DEFINE/      # EWA 定义文件
│   │           └── backgrounds/     # 背景图片
│   └── test/                        # 测试代码
├── compress/                        # 压缩脚本目录
│   ├── js.sh                        # JS 合并压缩脚本
│   ├── css.sh                       # CSS 压缩脚本
│   ├── compress_vue.sh              # Vue 资源压缩
│   └── compiler.jar                 # Google Closure Compiler
└── pom.xml                          # Maven 配置文件
```

## 构建和运行

### 前置条件

- JDK 1.8 或更高版本
- Maven 3.x

### 构建命令

```bash
# 编译项目
mvn clean compile

# 打包项目（生成 JAR 文件）
mvn clean package

# 安装到本地 Maven 仓库
mvn clean install

# 发布到 Maven Central（需要 GPG 签名）
mvn clean deploy -P release
```

### 测试命令

```bash
# 运行单元测试
mvn test
```

## 核心功能

### 资源加载器 (Resources.java)

项目核心是 `Resources` 类，提供以下功能：

1. **静态资源缓存**: 使用 `ConcurrentHashMap` 缓存已加载的资源
2. **安全校验**: 
   - 禁止访问 `..` 路径
   - 禁止访问特定扩展名（exe, bat, java, jsp 等）
   - 禁止访问配置文件（ewa_conf, application.yml）
3. **MIME 类型识别**: 自动识别 JS, CSS, HTML, JSON, 图片等类型
4. **MD5 校验**: 为每个资源生成 MD5 哈希值用于缓存验证

### Servlet 服务

`Servlet.java` 提供 HTTP 服务，用于响应静态资源请求：

- 支持 GET/POST 请求
- 设置缓存控制头（max-age=86400）
- 提供 ETag 和 MD5 校验头

## 压缩脚本

`compress/` 目录包含用于压缩静态资源的 Shell 脚本：

- **js.sh**: 使用 Google Closure Compiler 压缩 JavaScript
- **css.sh**: 压缩 CSS 文件
- **compress_vue.sh**: 压缩 Vue 相关资源
- **compress_app2.sh**: 压缩 App2 相关资源

## Maven 依赖

主要依赖：

| 依赖 | 版本 | 作用域 |
|------|------|--------|
| slf4j-api | 1.7.36 | provided |
| commons-io | 2.14.0 | compile |
| javax.servlet-api | 4.0.1 | provided |
| junit | 4.13.1+ | test |
| closure-compiler | v20250706 | compile |

## 开发规范

### 代码风格

- Java 代码遵循标准命名规范
- 使用 SLF4J 进行日志记录
- 资源文件统一使用 UTF-8 编码

### 安全实践

- 严格校验文件扩展名
- 防止路径遍历攻击（`..` 检查）
- 敏感配置文件禁止访问

### 发布流程

1. 更新 `pom.xml` 中的版本号
2. 运行 `mvn clean deploy -P release`
3. 需要配置 GPG 签名和 Sonatype 凭证

## 使用示例

### 作为 Maven 依赖

```xml
<dependency>
    <groupId>com.gdxsoft.easyweb</groupId>
    <artifactId>emp-script-static</artifactId>
    <version>1.1.10</version>
</dependency>
```

### 在代码中加载资源

```java
// 获取静态资源
Resource r = Resources.getResource("/EWA_STYLE/js/ewa.js");
if (r.getStatus() == 200) {
    String content = r.getContent();
    String md5 = r.getMd5();
}
```

## 相关文件

- `LICENSE`: MIT 许可证文件
- `README.md`: 项目简要说明
- `pom.xml`: Maven 项目配置
- `.gitignore`: Git 忽略规则
