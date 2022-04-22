//go:build !dev && !testnet && !prod
// +build !dev,!testnet,!prod

package secret

// const defaultMnemonic string = "install future tornado nerve belt bag impact foam gift melody prison swing protect afraid talent drive quote change final myself black define tongue stock"

const masterPassword string = "myPassword"

const mintBurnPassword string = ""

type HdWalletTypeIndex string

const (
	HdWalletLoginIndex    = "0"
	HdWalletPaymentIndex  = "1"
	HdWalletServerIndex   = "2"
	HdWalletPlatformIndex = "3"
)

const Tag = "default"

const base64PrivateKey string = `MIICXAIBAAKBgQC/tRg7gW4mVuS4YSUEaYCyw54VbVx/ruu2qml+E3MGtvYbRnGoAIEv2i/IMxTs0C3BSKXCiMDtihQgCIB1lYKL0zPllcYcZfD9Kk/+srOZE3XW0QMvlDAV500i1clycgC9lwJGv2jTeB0Sx7SG+mtK4GrytSZlHOJbLRuva1EZRwIDAQABAoGBAKpZxdq6vKKc/ElLKZWuGoq/gS4RK+zaBuMesvcxWTlSQ4chJcXgDOv0uhjwK1vz8XSblZAz7RwnYpLEe0IBRSpo/BgtjOiC0TLUE7oCzetzLixmuBlQc6ArU4PU/jwfZ3ownZHHSb73Sm4ex0c6Mk57gKdilkco4jx6cUn3vcnhAkEA44iScIc4V0SARQbO6z26KFr+gKXd63X6zyMVP4kQTKkrM7pYLqZxavZFElXCdVvebrKOrgf3QU0nNkw4bBVXywJBANexFkyF0Gro82LW3caL4CT3Ju0nz9Y2MNUViWQYCqj+EG1FAKM95egLQuplcMwyZPsWXM3k+cq7SHswk8/hvPUCQEzUA6Ztci+9WJZ2Kw4xhJc1ynPEDgAAkVS54uXWMSPBh23rAPWXi/py93WucX/RKnU0Y4sN84YgOBpUeES+nCsCQHokFfSPck6YS/sUodHlM7C7JJf3i4JKfays3XiJBMBd3v+Bq7LFQoP8nJAPkaiQgQ6Ow070818SXyEjiRCXTGECQGTbc4FgX/1yubQOsUqdDsyeBxh3ao8fMt9ut3BiaOAlldGLOSa7o3z3Xk87UxUF1vTBmNRnq3kSssXpFDYkoug=`
const Base64PublicKey string = `MIGJAoGBAL+1GDuBbiZW5LhhJQRpgLLDnhVtXH+u67aqaX4Tcwa29htGcagAgS/aL8gzFOzQLcFIpcKIwO2KFCAIgHWVgovTM+WVxhxl8P0qT/6ys5kTddbRAy+UMBXnTSLVyXJyAL2XAka/aNN4HRLHtIb6a0rgavK1JmUc4lstG69rURlHAgMBAAE=`

const userMainnetWalletPassPhrase string = "on9"

const userMainnetWalletDerivedPath string = "m/44'/60'/1'/0/"

const FaucetHdWalletPrivateKey string = `71d870d4cfe9d39c664bb99a4ee3afb272cc8af0844dabe40a02961fca326e10`

const PoolContractAddress string = "0x98B726387a96b4D541c98Be15b064689d2B768FA"
const FactoryContractAddress string = "0xFf8e64360867549c42AE8E877823fa7418c28c79"
const TokenUSDMContractAddress string = "0xEf3105EF306105364425A9B67393C0D389336a1F"
const TokenBTCMContractAddress string = "0x69458400FF11Dc765D7A407D1f6205e112CC6C67"
const TokenETHMContractAddress string = "0x26d11C81cc430F500E16D0b989486D0957641375"

//const PoolContractAddress string = "0xAf75F4d74E87a3d086A62168613D5aF1379d29e8"
//const FactoryContractAddress string = "0x616bD541Bf4F71AF098573b60d0354F6323f2874"
//const TokenUSDLContractAddress string = "0xbCc244faE554DB9104C18Bb872Bb627972C2dDF1"
//const TokenBTCLContractAddress string = "0x5D26948679cB6DE68f300bf7ecE11504E73A8c79"
//const TokenETHLContractAddress string = "0x1E7FACbbfbb8431762e8F66adE11fCAEDe05DF0A"

// const PoolContractAddress string = "0x2761bA473403956d18CDAc498934a11335D9f9eB"
// const FactoryContractAddress string = "0x77aa141945ACfE25B329d94f30a1c47069D2Ed22"
// const TokenUSDLContractAddress string = "0x61817cD2124dc67Dd4cD038fD7E97E7186742a37"
// const TokenBTCLContractAddress string = "0xD53A44d795BDb2BeFA0eFa94Fcc00E12794D0aAd"
// const TokenETHLContractAddress string = "0xf7905405E178Ad709cF5189726cc9cE7511cC99D"

// const PoolContractAddress string = "0x355414fe1DAd4ef0aAd51a17Ccba4165A6a1cCF8"
// const FactoryContractAddress string = "0x44b5781F9dA8D5BcB471f307480b754B191FFF9B"
// const TokenUSDMContractAddress string = "0x4a3eAB424DAbf855fC9F9Fe4469Ce2295d1EF043"
// const TokenBTCMContractAddress string = "0x939fDD4423396A9ee083519CCF8a25142f3e97dC"
// const TokenETHMContractAddress string = "0x2e3266B417Bac1DefD9cEE72E71791201Eb197b9"
