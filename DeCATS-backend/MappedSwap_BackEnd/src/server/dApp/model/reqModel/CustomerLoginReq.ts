export class CustomerLoginReq {
  signature: string;
  address: string;
  message: string;
  fundingCode: string | null;
  type: number;
  centralizedWalletAddress: string | null;
  signatureType: string | null;
  constructor() {
    this.signature = '';
    this.address = '';
    this.message = '';
    this.fundingCode = null;
    this.type = 0;
    this.centralizedWalletAddress = null;
    this.signatureType = null;
  }
}
