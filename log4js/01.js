var log4js=require('log4js');

var logger=log4js.getLogger();

logger.level="debug";
//note 默认的level是关闭的，使用时可以设置不同的等级，来记录对应level的bug
logger.debug("some debug message");