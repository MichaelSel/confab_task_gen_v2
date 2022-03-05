const fs = require('fs');
const EDO = require('edo.js').EDO
const csv = require('csvtojson')

const folder = './task_sets_debug/CON2FABc0000/csv'
let csvs = []
let jsons = []

const load_paths = () => {
    fs.readdir(folder,(err,f) => {
        f.forEach(file=>{
            if(file.endsWith('csv')) csvs.push(folder + "/" + file)
            if(file.endsWith('json')) jsons.push(folder + "/" + file)
        })
        parseFiles()

    })
}



const parseFiles = async () => {
    let done = 0


    csvs = csvs.map(async (file)=>await csv().fromFile(file))
    Promise.all(csvs).then((values)=> {
        csvs = values
        done++
        if(done==2) verifyFiles()
    })

    jsons = jsons.map(async (file)=>await fs.promises.readFile(file,"binary"))
    Promise.all(jsons).then((values)=> {
        values = values.map(json=>JSON.parse(json))
        jsons = values
        done++
        if(done==2) verifyFiles()
    })





}

const verifyFiles = () => {
    let edo = new EDO()
    let files_match = []
    for (let block = 0; block < csvs.length; block++) {
        for (let q = 0; q < csvs[block].length; q++) {
            let csv = csvs[block]
            let json = jsons[block]
            let keys = Object.keys(csv[0])
            let matches = json.map((e,i)=>{
                let match = true
                keys.forEach(key=>{
                    if(String(csv[i][key])!=String(json[i][key])) match=false
                })
                return match
            })
            matches = Boolean(matches.reduce((ag,e)=>ag & e,true))
            files_match.push(matches)
        }
    }


    let mode_match_set = []
    let mode_match_probePitches = []
    let probe_uses_all_pitches = []
    let probe_match_probePitches = []
    let novel_not_in_set = []
    let in_set_is_in_set = []
    let in_set_not_in_probe = []
    let in_melody_is_in_melody = []
    for (let b = 0; b < csvs.length; b++) {
        let block = csvs[b]
        for (let Q = 0; Q < block.length; Q++) {
            let q = block[Q]
            let set  = edo.scale(q['set'].split(',').map(e=>parseInt(e))).normal().pitches
            let mode_norm  = edo.scale(q['mode_pitches'].split(',').map(e=>parseInt(e))).normal().pitches
            let mode  = edo.scale(q['mode_pitches'].split(',').map(e=>parseInt(e))).pitches
            mode_match_set.push((JSON.stringify(set)==JSON.stringify(mode_norm)) && (JSON.stringify(mode_norm)==JSON.stringify([0,1,2,4,6,8,10])))

            let probe_pitches  = q['probe_pitches'].split(',').map(e=>parseInt(e))
            mode_match_probePitches.push(edo.is.subset(probe_pitches,mode))

            let probe_set  = Array.from(new Set(q['probe'].split(',').map(e=>parseInt(e)).map(e=>(e-parseInt(q['transposition']))%12))).sort((a,b)=>a-b)
            probe_uses_all_pitches.push(probe_set.length==6)
            probe_match_probePitches.push(edo.is.subset(probe_set,probe_pitches))

            let probe = q['probe'].split(',').map(e=>parseInt(e))

            let test = parseInt(q['test'])

            if(q['type']=="in_melody") {
                test = edo.mod(test,12)
                probe = probe.map(n=>edo.mod(n,12))
                in_melody_is_in_melody.push(probe.indexOf(test)!=-1)
                if(probe.indexOf(test)==-1) console.log(test,probe)

            }
            else if(q['type']=="in_set") {
                in_set_not_in_probe.push(probe.indexOf(test)==-1)
                in_set_is_in_set.push(mode.indexOf(test-parseInt(q['transposition']))!=-1)

            }
            else if(q['type']=="novel") {
                novel_not_in_set.push(mode.indexOf(test-parseInt(q['transposition']))==-1)
            }

        }
    }
    console.log("JSONs and CSVs match:", Boolean(files_match.reduce((ag,e)=>ag & e,true)))
    console.log("Mode matches set:", Boolean(mode_match_set.reduce((ag,e)=>ag & e,true)))
    console.log("Mode matches probe pitches:", Boolean(mode_match_probePitches.reduce((ag,e)=>ag & e,true)))
    console.log("Probe uses 6 of 7 pitches:", Boolean(mode_match_probePitches.reduce((ag,e)=>ag & e,true)))
    console.log("Probe matches probe pitches:", Boolean(probe_match_probePitches.reduce((ag,e)=>ag & e,true)))
    console.log("In melody test appears in probe:", Boolean(in_melody_is_in_melody.reduce((ag,e)=>ag & e,true)))
    console.log("In set test doesn't appear in probe:", Boolean(in_set_not_in_probe.reduce((ag,e)=>ag & e,true)))
    console.log("In set test belongs to set:", Boolean(in_set_is_in_set.reduce((ag,e)=>ag & e,true)))
    console.log("Novel test is not in set:", Boolean(novel_not_in_set.reduce((ag,e)=>ag & e,true)))



}

load_paths()
