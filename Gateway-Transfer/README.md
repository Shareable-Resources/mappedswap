

dev

address
```
    0x8F9092CE573e41d72378Cf8c9d3335584e6843F1
```    
Encrypted private key (24bd4333e04f633b74437582abb4f043ee876bc515c22ffb4181744305ca54dc)
```
    #encrypted private key
    $mappedswap$m=cbc,h=fc17048589ee51cddf4766769c087aad3f0ed48f8985878e013c5131bfc8bf7f,i=5a357c91778e80684e214f438a756540,s=2bjIg0XwYDOn,r=500000$s35t4+rL53+67mCohgo5pnE0EHN8tno/HVQaUOWTFoTq+KVGvJHAFE6vwWwgTsjgwAiV8nwtxvkY5JipgbYA6xW6pQ9+s5YE/7biuCdcqg4=

    #password
    abc
```

Create bundle:

In terminal type

```
    npm run webpack
```
which will run "webpack" script in package.json and create files in all env under "dist/webpack"

Environment:
- dev
    - 13.228.78.179
    - ms-obs-Dev.pem
- testnet
    - 54.254.169.193
    - ms-obs-Testnet.pem

>use cert to connect to server in terminal
e.g. ssh -i ~/.ssh/ms-obs-Dev.pem ubuntu@13.228.78.179



start service
```
pm2 start dist/webpack/{env}/bundle.js --name GatewayTransfer
#e.g.
pm2 start dist/webpack/dev/bundle.js --name GatewayTransfer
```

restart service
```
pm2 restart GatewayTransfer
```

stop service
```
pm2 stop GatewayTransfer
```

delete service
```
pm2 delete GatewayTransfer
```

attach service console
```
pm2 attach {console_id}
```
