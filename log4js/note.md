# log4js

## API configuration 
* 可以接收配置文件路径string （string 路径对应的配置文件需为JSON格式，且包含配置对象）
* 也可以直接接收配置对象
* 引入log4js模块后，应当立即调用configure配置，如果没有调用，会使用系统默认的，但是默认的level是OFF的，所以不会有日志输出
* 如果使用cluster集群，不需要进行特别的配置，appender只会定义到mastr上，所以避免了多个worker processes 同时写一个log文件
* **configuration必须包含至少一个appender和一个default category**

### Configuration Object
Properties:
* level(opt,obj)
    - string组成的map,**不区分大小写**
    - 默认顺序 ALL<TRACE<DEBUG<INFO<WARN<ERROR<FATAL<MARK<OFF 
* appenders(obj)
    - 追加定义
    - 属性名(everything)可以自定义，属性值必须包含type，其他的根据type的类型而定
* categories(obj)
    - 将appender分类，可以定义不同的level,必须有一个默认的category
    - category的属性：**必须含有一个appender及level**
* pm2(opt,boolean)
    - 如果使用pm2运行程序，需将此属性设置为true，否则不会记录log信息
* pm2InstanceVar(opt,string)
    - pm2前提下，若更改了默认的实例变量的名称 (NODE_APP_INSTANCE )
* disableClustering(opt,boolean)
    - 设置此选项为true时，将忽略cluster环境，每个worker process记录自己的log，但是要注意，若是将log写入到文件中，可能会引发weirdness,多个process操作同一个文件
```js
log4js.configure({
  appenders: {
    everything: { type: 'file', filename: 'all-the-logs.log' }
  },
  categories: {
    default: { appenders: [ 'everything' ], level: 'debug' }
  }
});
```



### Loggers -log4js.getLogger([category])
方法接收一个category属性名称的参数，如果没有特别指定，则使用默认的category配置
方法返回一个logger对象，logger对象有用category对应的level等级的方法，可以记录对应的log信息，按照category对应的appenders存储。

#### logger对象的方法function
* <level> 等级名称小写的方法，记录日志信息 
  - logger.info('xxx')
  - info为log4js.getLogger([category]) category中定义的level, 同名的level等级
* is<level>Enable 判断某种等级的方法是否可用 返回bool
  - isInfoEnable  对应appender中的level
* addContext(<key>,<value>) 添加键值对  
  - 目前只有logFaces appenders中使用
* removeContext(<key>) 删除键值对
* clearContext() 清空键值对
* level 改变logger实例的level等级，会改变通过该category生成的所有logger等级

### Shutdown -log4js.shutdown(callback)
可以用在当程序退出前，检验是否所有的log信息写入完成
接收一个回调函数，在log4js关闭所有的appenders，且结束所有log的写入操作后调用。

### Custom Layouts - log4js.addLayout(type,fn)
用来设置用户自己的layouts样式

## Appenders
* appenders可以将log信息输出。
* 可选的格式：文件、邮件或通过网络直接发送数据
```js
const log4js = require('log4js');
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: { type: 'file', filename: 'application.log' }
  },
  categories: {
    default: { appenders: [ 'out', 'app' ], level: 'debug' }
  }
});
```

### Core Appenders (核心Appenders) 
有些需要其他的依赖(smtp需要nodemailer)
* file
* dateFile
* stderr
* stdout
* categoryFilter
* logLevelFilter

### Optional Appenders
log4js支持以下appenders，但是并不是作为核心appender分发，所以type 应当使用'@log4js-node/gelf'指定
* gelf
* smtp
* redis
* hipchat

### 也可以自定义appenders

## Layouts
定义log信息的输出样式，有默认的一般不需要自己定义。



















































###  file appender
* File appender可以将log写入到文件，支持配置文件大小、备份文件的数量
* 当使用File appender时，需要call log4js.shutdown?
* 为了确保程序结束时，log信息都写入至file文件，本插件已经添加了streamroller库
* backup+compress 当日志设定了最大值后，达到上限大小时，会自动将当前文件压缩重命名 log.1.gz,若果有达到了最大值，log.1.gz重命名为log.2.gz，log文件命名为log.1.gz 循环往复 backup设置保留的历史日志的个数。新旧程度 .log ,log.1.gz,log.2.gz...

#### Configuration 
* type:"file"
* filename: string 日志文件的路径
* maxLogSize: integer 日志文件size的最大值，如果不配置，日志不会自动滚动，都写在一个文件里
* backups:integer 默认值5 日志滚动是，保存的旧日志文件的数量
* layout : 显示样式
------------------------------------------------------------------
会传递给streamroller的配置参数
* encoding:string (utf-8)
* mode:integer(0644) wwh?
* flages:string (a) wwh?
* compress:boolean(false) 日志rolling时，是否压缩旧的日志文件(.gz)
* keepFileExt:boolean(false) 日志rotaing时，是否保留后缀（file.log 变为file.1.log 保留后缀，而不是file.log.1 不保留后缀）

#### 配置示例
```js
log4js.configure({
  appenders: {
    everything: { type: 'file', filename: 'all-the-logs.log' }
  },
  categories: {
    default: { appenders: [ 'everything' ], level: 'debug' }
  }
});

const logger = log4js.getLogger();
logger.debug('I will be logged in all-the-logs.log');
```
backup+compress
```js
log4js.configure({
  appenders: {
    everything: { type: 'file', filename: 'all-the-logs.log', maxLogSize: 10485760, backups: 3, compress: true }
  },
  categories: {
    default: { appenders: [ 'everything' ], level: 'debug'}
  }
});
```