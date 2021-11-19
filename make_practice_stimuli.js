const EDO = require("edo.js").EDO
let edo = new EDO(12)
const mod = (n, m) => {
    return ((n % m) + m) % m;
}
const JS = function (thing) {
    return JSON.stringify(thing).replace(/"/g,'')
}

const CJS = function (thing) {
    console.log(JS(thing))
}
const rand_int_in_range = function (min,max) {
    return Math.floor(Math.random() * (max - min +1)) + min
}

const rand_int_in_range_but_not_zero = function (min,max) {
    let val = Math.floor(Math.random() * (max - min +1)) + min
    while(val==0) val = Math.floor(Math.random() * (max - min +1)) + min
    return val
}



const make_practice_stimuli = function (subject_id) {

    let stimuli = []


    const set = edo.scale([0,1,3,5,6,8,10])
    const manipulations = [
        {
            omit: 7, //scale degree (1 through 7)
            // violate: [-1,+1]
            violate: [-1] //how to manipulate the given scale degree to violate the set
        },
        {
            omit: 6, //scale degree (1 through 7)
            // violate: [-1,+1]
            violate: [-1]
        },
        {
            omit: 4, //scale degree (1 through 7)
            violate: [-1]
        },
        {
            omit: 3, //scale degree (1 through 7)
            // violate: [-1,+1]
            violate: [+1]
        },
        {
            omit: 2,
            violate: [+1]
        }
    ]

    /**Types of trials*/
        //Real: was in the melody
        //Foil: wasn't in the melody but belongs to the set (accept)
        //Foil: wasn't in the melody and doesn't belong to the set (violate)

    const make_probe = function (pitches) {
            const range = [0,12]
            const allow_repetitions=true
            const avoid_leaps=6
            const end_with_first=false
            const probe = edo.get.random_melody(13,range,allow_repetitions,pitches,avoid_leaps,end_with_first)
            const unique = Array.from(new Set(probe.map(p=>(p+Math.pow(edo.edo,3))%edo.edo)))
            if(unique.length<pitches.length) return make_probe(pitches) //make sure all pitches of the set are used
            return probe
        }


    manipulations.slice(0,2).forEach(man=>{
        let len = set.count.pitches()
        let mode = set.mode(1)
        let omit_pos = edo.mod((man.omit-1)-1,len)
        let probe_pitches = [...mode.pitches.slice(0,omit_pos),...mode.pitches.slice(omit_pos+1)]
        let omitted = mode.pitches[omit_pos]
        let violate = edo.mod(omitted+man.violate[0],edo.edo)

        // MAKE SURE THIS ISN'T A NOT THAT APPEARS IN THE LAST QUARTER OF THE MELODY

        //Select a random note from the 1st half of the melody that isn't in the last quarter


        let transpose_1 = 0
        let transpose_2 = 0
        let transpose_3 = 0
        let probe_melody1 = make_probe(probe_pitches).map(p=>p+transpose_1)
        let probe_melody2 = make_probe(probe_pitches).map(p=>p+transpose_2)
        let probe_melody3 = make_probe(probe_pitches).map(p=>p+transpose_3)
        let notes_not_in_last_quarter = probe_pitches.filter(n=>probe_melody1.slice(Math.floor(probe_melody1.length*0.75)).indexOf(n)==-1)
        let random_in_melody = notes_not_in_last_quarter[rand_int_in_range(0,notes_not_in_last_quarter.length-1)]
        stimuli.push({
            subject_id:subject_id,
            set: set.pitches,
            mode: 1,
            mode_pitches: mode.pitches,
            probe_pitches: probe_pitches,
            omitted_pos: omit_pos,
            transposition: transpose_1,
            probe: probe_melody1,
            test: random_in_melody+transpose_1,
            type: "in_melody",
            practice: true,
            block:0
        })

        stimuli.push({
            subject_id:subject_id,
            set: set.pitches,
            mode: 1,
            mode_pitches: mode.pitches,
            probe_pitches: probe_pitches,
            transposition: transpose_2,
            probe: probe_melody2,
            test: omitted+transpose_2,
            type: "in_set",
            practice: true,
            block:0
        })

        stimuli.push({
            subject_id:subject_id,
            set: set.pitches,
            mode: 1,
            mode_pitches: mode.pitches,
            probe_pitches: probe_pitches,
            transposition: transpose_3,
            probe: probe_melody3,
            test: violate+transpose_3,
            type: "novel",
            practice: true,
            block:0
        })

    })

    stimuli = edo.shuffle_array(stimuli)
    return stimuli


}




module.exports = make_practice_stimuli


