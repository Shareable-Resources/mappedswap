const fs = require('fs');
//const path = require('path');
//var cwd  = path.dirname(fs.realpathSync(__filename));

let config = null;

module.exports = (env)=>{

    if(!config){
        const cwd  = process.cwd();
        const configFilePath = `${cwd}/config/config-${env}.json`;
        
        console.info(`Load config from ${configFilePath}`);
        
        let checkListJsonStr = fs.readFileSync(configFilePath);
        config = JSON.parse(checkListJsonStr);
    }
    return config;
};