import  fs  from 'fs';
import  Web3 from 'web3';
import { HttpProviderOptions } from "web3-core-helpers";
import { HttpProviderBase } from "web3-core-helpers";

export class EthClient {
    web3Client : Web3 ;
    chainId : number;
    public static abiJsonRootPath = "../../smartcontract/build/contracts/"

    constructor(url: string, chainId: number, timeout? : number){
        let timeoutVal : number = 30000;
        if (timeout){
            timeoutVal = timeout;
        }
		let options: HttpProviderOptions = {
			keepAlive: false,
			timeout: timeoutVal,
		};

		let provider: HttpProviderBase = new Web3.providers.HttpProvider(
			url,
			options
		);

		this.web3Client = new Web3(provider);
        this.chainId = chainId;
    }

    public NewSmartContract<SmartContractType>(className: string, scAddress: string) : SmartContractType{
        const abiObject = JSON.parse(fs.readFileSync(EthClient.abiJsonRootPath + className + ".json").toString('utf8'))
        
        
        return (new this.web3Client!.eth.Contract(abiObject.abi, scAddress) as any) as SmartContractType;
    }
}
