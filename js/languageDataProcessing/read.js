const Excel = require('exceljs');
const fs = require('fs');

const filePath = '2011/DDW-C16-STMT-MDDS-0000.xlsx';


const StateFileHeaders = {
    "TableName": 1,
    "StateCode": 1,
    "DistrictCode": 1,
    "SubDistrictCode": 1,
    "AreaName": 1,
    "MotherTongueCode": 1,
    "MotherTongueName": 1,
    "Total": 1,
    "TotalM": 1,
    "TotalF": 1
}
const stateFilesDataStartAtCol = 6;

function getBaseFileAsJSON(filePath) {
    return new Promise(function (resolve, reject) {
        const infoArray = [];
        var workBookRef = new Excel.Workbook();
        workBookRef.xlsx.readFile(filePath)
            .then(function () {
                var worksheet = workBookRef.getWorksheet(1);
                const colHeaders = Object.keys(StateFileHeaders);
                worksheet.eachRow(function (row, rowNumber) {
                    if (rowNumber > stateFilesDataStartAtCol) {
                        const info = {};
                        colHeaders.forEach((header, i) => {
                            info[header] = isNaN(Number(row.values[i + 1])) ? row.values[i + 1] : Number(row.values[i + 1]);
                        });
                        infoArray.push(info)
                    }
                });
                resolve(infoArray);
            });
    })
}

async function getStatesDists(file) {
    const data = await getBaseFileAsJSON(file);

    const districtMap = {};
    let stateName = null;

    data.forEach((row) => {
        if (row.DistrictCode === 0 && !stateName) {
            stateName = row.AreaName;
        }
        if (row.DistrictCode > 0) {
            if (row.SubDistrictCode === 0) { // only district

                if (row.MotherTongueCode % 1000 === 0) { // only main language
                    // const code = `${row.DistrictCode} ${row.SubDistrictCode`
                    if (!districtMap[row.DistrictCode]) {
                        districtMap[row.DistrictCode] = {
                            'code': row.DistrictCode,
                            'name': row.AreaName
                        };
                    }
                    if (!districtMap[row.DistrictCode][row.MotherTongueCode]) {
                        districtMap[row.DistrictCode][row.MotherTongueCode] = {
                            'code': row.MotherTongueCode,
                            'name': row.MotherTongueName,
                            T: row.Total,
                            M: row.TotalM,
                            F: row.TotalF
                        }
                    }
                }
            }
        }
    });
    // let total = 0;
    // Object.keys(districtMap).forEach((DIS) => {
    //     total += districtMap[DIS][11000].T;
    // });

    // if (32413213 !== total) {
    //     console.error("Test fail");
    // }
    // console.log(total);


    const hierarchy = {
        name: stateName,
        children: []
    }

    Object.keys(districtMap).forEach((d) => {
        const dist = {
            name: d.name,
            children: []
        }
        Object.keys(districtMap[d]).forEach((lanCode) => {
            if (lanCode === 'name') {
                dist.name = districtMap[d][lanCode]
            } else if (lanCode === 'code') {
                dist.code = districtMap[d][lanCode]
            } else {
                // dist.T += districtMap[d][lanCode].T;
                dist.children.push(districtMap[d][lanCode]);
            }
        })
        hierarchy.children.push(dist);
    });

    console.log('Done: ', file)
    return hierarchy;

    // fs.writeFile('myjsonfile.json', JSON.stringify([hierarchy]), 'utf8', (e, d) => {
    //     console.log(e)
    // });

}

async function getIndiaLevel() {
    const data = await getBaseFileAsJSON('2011/DDW-C16-STMT-MDDS-0000.xlsx');
    const indiaLangs = [];
    let total = 0;
    data.forEach((row) => {
        if (row.StateCode === 0) {
            if (row.MotherTongueCode % 1000 === 0) { // only main language
                indiaLangs.push({
                    'code': row.MotherTongueCode,
                    'name': row.MotherTongueName,
                    T: row.Total,
                    M: row.TotalM,
                    F: row.TotalF
                });
                total += row.Total;
            }
        }
    });
    console.log("India total P : ", total);
    fs.writeFile('dataProcessed/india-level.json', JSON.stringify(indiaLangs), 'utf8', (e, d) => {
        console.log(e)
    });
}

async function getIndiaStateLevel() {
    const data = await getBaseFileAsJSON('2011/DDW-C16-STMT-MDDS-0000.xlsx');
    const stateMaps = {};
    let total = 0;
    const nodes = [];
    const links = [];
    data.forEach((row) => {
        if (row.StateCode == 7) {

            if (!stateMaps[row.StateCode]) {
                stateMaps[row.StateCode] = {
                    name: row.AreaName,
                    languages: []
                };
            }
            const percentage = row.Total / 16335592 * 100;

            if (row.MotherTongueCode % 1000 === 0 && percentage > 0.3) { // only main language

                stateMaps[row.StateCode].languages.push({
                    'code': row.MotherTongueCode,
                    'name': row.MotherTongueName,
                    T: row.Total,
                    M: row.TotalM,
                    F: row.TotalF
                });


                if (nodes.indexOf(row.AreaName) === -1) {
                    nodes.push(row.AreaName);
                }
                if (nodes.indexOf(row.MotherTongueName) === -1) {
                    nodes.push(row.MotherTongueName);
                }
                links.push({
                    source: nodes.indexOf(row.AreaName),
                    target: nodes.indexOf(row.MotherTongueName),
                    value: row.Total,
                    names: [row.AreaName, row.MotherTongueName],
                    percentage: percentage
                })
                total += row.Total;
            }
        }
    });
    console.log(total)
    const nodesLinks = {
        nodes: nodes.map((d) => { return { name: d } }),
        links
    }

    fs.writeFile('dataProcessed/india-state-level.json', JSON.stringify(nodesLinks), 'utf8', (e, d) => {
        console.log(e)
    });
}

async function getAllStatsDists() {

    const stateData = {
        name: 'India',
        children: []
    };
    const states = []
    for (let i = 32; i <= 32; i++) {
        let filePath = '2011/DDW-C16-STMT-MDDS';
        if (i < 10) {
            filePath += `-0${i}00.xlsx`;
        } else {
            filePath += `-${i}00.xlsx`;
        }
        states.push(getStatesDists(filePath));
        //stateData.push(data);
    }
    stateData.children = await Promise.all(states);

    fs.writeFile('dataProcessed/kerala.json', JSON.stringify([stateData]), 'utf8', (e, d) => {
        console.log(e)
    });
}

getAllStatsDists();
