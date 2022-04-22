# Crypto tools

If you have not installed NodeJS, install node 14.18.0.
```
   wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   nvm install 14.18.0
```

Install eth-crypto, if you need to encrypt contents with input private key.
```
    npm install eth-crypto
```

Encrypt your secret text.
```
    npm start
```

Output like this (private key for testing: 0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07)
```
Please input content: 
You input a private. corresponding address: 0x3f243FdacE01Cfd9719f7359c94BA11361f32471
Your password: 
Confirm password: 
Encrypted private key: $mappedswap$m=cbc,h=438ea9bfa58dcdff7f67a94773bfd2eb28ef91f80a7c14633bc48b8162910ba2,i=3eb9efc0951871525442f5fbba2de4dc,s=ebWiIGtwNxeR,r=500000$I1q+cQ74CAvxaZVzwr2vipZfzD5Zg3MbtpRhypSJrVbsx7w2WKIYP75/TmIK7pSl4pHpSfKvq42VOBaRcEUsrpRqnpzjFi4g9DQB7yFkuCU=
Encrypt with private key(Enter empty string to exit): a
Encryped text: 01cf548f279a5c75e7d2d0cb5a7dd69703a9a1d0eb662acb2ee190a2f1a7d00ac39cb59f232e9a30f97e63491cd81e13809e34188cb8780f6117436dd1d67c056a04a8d1048a0d7156768dcafad827b6a574c3896bf818e73835b86139ff4e6317
Encrypt with private key(Enter empty string to exit): 
Exited.
```