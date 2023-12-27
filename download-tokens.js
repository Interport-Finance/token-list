const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SELECTED_CHAIN_ID = '534352'

const download = async (url, destinationPath) => {
    try {
        const response = await axios.get(url, { responseType: 'stream' });
        const writer = fs.createWriteStream(destinationPath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.log(Error(`Failed to download image: ${url} ${error.message}`))
    }
}

const changeImageURL = (tokenList) => {
    return Object.values(tokenList).map(token=>({...token, logoURI: `https://raw.githubusercontent.com/Interport-Finance/token-list/main/src/images/${SELECTED_CHAIN_ID}/${token?.address?.toLowerCase()}.png`}))
}

const formatZkEVM = (data) => {
    try {
        const array = Object.values(data).map(({symbol, name, address, decimals}) => {
            if(!address)return null
            return ({
                symbol,
                name,
                address: address?.toLowerCase(),
                decimals,
                logoURI: `https://raw.githubusercontent.com/Interport-Finance/token-list/main/src/images/${SELECTED_CHAIN_ID}/${address?.toLowerCase()}.png`,
            })
        }).filter(item => !!item)

        return array
    }catch (e) {
        console.log(e)
        return {}
    }
}

const formatBaseNetw = (data) => {
    try {
        const array = data?.data?.map((token) => {
            const address = token?.tokens?.find((token) => token?.platformName === 'Base')?.address?.toLowerCase()

            if(!address)return null
            return ({
                symbol: token?.symbol,
                name: token?.name,
                address,
                decimals: 18,
                logoURI: `https://raw.githubusercontent.com/Interport-Finance/token-list/main/src/images/${SELECTED_CHAIN_ID}/${address?.toLowerCase()}.png`,
            })
        }).filter(item => !!item)

        return array
    }catch (e) {
        console.log(e)
        return {}
    }
}

const formatScrollNetw = (data) => {
    try {
        const array = data?.data?.tokens.map((token) => {
            if(!token)return null
            return ({
                symbol: token?.symbol,
                name: token?.name,
                address: token?.address?.toLowerCase(),
                decimals: token?.decimals,
                logoURI: `https://raw.githubusercontent.com/Interport-Finance/token-list/main/src/images/${SELECTED_CHAIN_ID}/${token?.address?.toLowerCase()}.png`,
            })
        }).filter(item => !!item)

        return array
    }catch (e) {
        console.log(e)
        return {}
    }
}

const getDataZkEVM = async () => {
    const response = await axios.get(`https://market-api.openocean.finance/v2/${SELECTED_CHAIN_ID === '204' ? 'opbnb' : SELECTED_CHAIN_ID === '1101' ? 'polygon_zkevm' : 'linea'}/token`)
    const formatted = formatZkEVM(response.data.data)
    fs.writeFileSync(`src/tokens/${SELECTED_CHAIN_ID}.json`, JSON.stringify(formatted));
    console.log('JSON file was successfully saved');
    const imageList = Object.values(response.data.data).map(({icon, address})=>({url: icon, address}))

    let isCreatedDirectory = false

    fs.access(path.join('src', 'images', SELECTED_CHAIN_ID), fs.constants.F_OK, (err) => {
        if (err && !isCreatedDirectory) {
            fs.mkdir(path.join('src', 'images', SELECTED_CHAIN_ID), { recursive: true }, (err) => {
                if (err) {
                    console.error('Error while creating directory: ', err);
                }
            })
            isCreatedDirectory = true
        }
    });
    imageList.forEach(({url, address})=>{
        try {
            const name = address.toLowerCase() + '.png'
            download(url, path.join('src', 'images', SELECTED_CHAIN_ID, name))
        }catch (e) {
            console.log(e)
        }
    })
}



const getDataBaseNetw = async () => {
    const response = (await axios.get(`https://api.cryptorank.io/v0/coins?platformKeys=base`)).data
    const formatted = formatBaseNetw(response)

    fs.writeFileSync(`src/tokens/${SELECTED_CHAIN_ID}.json`, JSON.stringify(formatted));

    const imageList = response?.data?.map((token) => {
        const address = token?.tokens?.find((token) => token?.platformName === 'Base')?.address?.toLowerCase()

        if(!address)return null
        return ({
            address,
            url: token?.image?.native,
        })
    }).filter(item => !!item)

    let isCreatedDirectory = false

    fs.access(path.join('src', 'images', SELECTED_CHAIN_ID), fs.constants.F_OK, (err) => {
        if (err && !isCreatedDirectory) {
            fs.mkdir(path.join('src', 'images', SELECTED_CHAIN_ID), { recursive: true }, (err) => {
                if (err) {
                    console.error('Error while creating directory: ', err);
                }
            })
            isCreatedDirectory = true
        }
    });
    imageList.forEach(({url, address})=>{
        try {
            const name = address.toLowerCase() + '.png'
            download(url, path.join('src', 'images', SELECTED_CHAIN_ID, name))
        }catch (e) {
            console.log(e)
        }
    })
}

const getDataScrollNetw = async () => {
    const response = (await axios.get(`https://ks-setting.kyberswap.com/api/v1/tokens?page=1&pageSize=100&isWhitelisted=true&chainIds=534352`)).data
    const formatted = formatScrollNetw(response)

    fs.writeFileSync(`src/tokens/${SELECTED_CHAIN_ID}.json`, JSON.stringify(formatted));

    const imageList = response?.data?.tokens?.map((token) => {
        if(!token) return null

        return ({
            address: token?.address.toLowerCase(),
            url: token?.logoURI,
        })
    }).filter(item => !!item)

    let isCreatedDirectory = false

    fs.access(path.join('src', 'images', SELECTED_CHAIN_ID), fs.constants.F_OK, (err) => {
        if (err && !isCreatedDirectory) {
            fs.mkdir(path.join('src', 'images', SELECTED_CHAIN_ID), { recursive: true }, (err) => {
                if (err) {
                    console.error('Error while creating directory: ', err);
                }
            })
            isCreatedDirectory = true
        }
    });
    imageList.forEach(({url, address})=>{
        try {
            const name = address.toLowerCase() + '.png'
            download(url, path.join('src', 'images', SELECTED_CHAIN_ID, name))
        }catch (e) {
            console.log(e)
        }
    })
}

const fetchData = async () => {
    try {
        if(SELECTED_CHAIN_ID === '1101' || SELECTED_CHAIN_ID === '59144' || SELECTED_CHAIN_ID === '204'){
            return await getDataZkEVM().catch(console.log)
        }
        if(SELECTED_CHAIN_ID === '8453'){
            return await getDataBaseNetw().catch(console.log)
        }
        if(SELECTED_CHAIN_ID === '534352'){
            return await getDataScrollNetw().catch(console.log)
        }
        const response = await axios.get(`https://tokens.1inch.io/v1.2/${SELECTED_CHAIN_ID}`)
        const formatted = changeImageURL(response.data)
        const imageList = Object.values(response.data).map(({logoURI, address})=>({url: logoURI, address}))

        let isCreatedDirectory = false

        fs.access(path.join('src', 'images', SELECTED_CHAIN_ID), fs.constants.F_OK, (err) => {
            if (err && !isCreatedDirectory) {
                fs.mkdir(path.join('src', 'images', SELECTED_CHAIN_ID), { recursive: true }, (err) => {
                    if (err) {
                        console.error('Error while creating directory: ', err);
                    }
                })
                isCreatedDirectory = true
            }
        });
        imageList.forEach(({url, address})=>{
            try {
                const name = address.toLowerCase() + '.png'
                download(url, path.join('src', 'images', SELECTED_CHAIN_ID, name))
            }catch (e) {
                console.log(e)
            }
        })

        fs.writeFileSync(`src/tokens/${SELECTED_CHAIN_ID}.json`, JSON.stringify(formatted));
        console.log('JSON file was successfully saved');
    }catch (error) {
        console.error('An error occurred while executing the request:', error);
    }
}

fetchData()