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



const make_stimuli = function (subject_id, how_many_multiples_of_15=1) {

    let stimuli = []


    const set = edo.scale([0,2,4,5,6,8,10])
    // const manipulations = [ // This was for diatonic
    //     {
    //         omit: 7, //scale degree (1 through 7)
    //         // violate: [-1,+1]
    //         violate: [-1] //how to manipulate the given scale degree to violate the set
    //     },
    //     {
    //         omit: 6, //scale degree (1 through 7)
    //         // violate: [-1,+1]
    //         violate: [-1]
    //     },
    //     {
    //         omit: 4, //scale degree (1 through 7)
    //         violate: [-1]
    //     },
    //     {
    //         omit: 3, //scale degree (1 through 7)
    //         // violate: [-1,+1]
    //         violate: [+1]
    //     },
    //     {
    //         omit: 2,
    //         violate: [+1]
    //     }
    // ]

    const manipulations = [
        {
            omit: 7, //scale degree (1 through 7)
            // violate: [-1,+1]
            violate: [-1] //how to manipulate the given scale degree to violate the set
        },
        {
            omit: 6, //scale degree (1 through 7)
            // violate: [-1,+1]
            violate: [-1] //how to manipulate the given scale degree to violate the set
        },
        {
            omit: 5, //scale degree (1 through 7)
            // violate: [+1]
            violate: [+1] //how to manipulate the given scale degree to violate the set
        },
        // {
        //     //TODO: **** Do I want to violate into diatonic? Probably not. Consult with Omri
        //     omit: 3, //scale degree (1 through 7)
        //     // violate: [-1]
        //     violate: [-1] //how to manipulate the given scale degree to violate the set
        // },
        {
            omit: 2, //scale degree (1 through 7)
            // violate: [-1,+1]
            violate: [+1] //how to manipulate the given scale degree to violate the set
        },
        {
            omit: 1, //scale degree (1 through 7)
            // violate: [-1,+1]
            violate: [+1] //how to manipulate the given scale degree to violate the set
        },

    ]

    /**Types of trials*/
        //in_melody: was in the melody
        //in_set: wasn't in the melody but belongs to the set (accept)
        //novel: wasn't in the melody and doesn't belong to the set (violate)

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


    manipulations.forEach(man=>{
        let len = set.count.pitches()
        let i = rand_int_in_range(0,6)
        let mode = set.mode(i)
        let omit_pos = edo.mod((man.omit-i)-1,len)
        let probe_pitches = [...mode.pitches.slice(0,omit_pos),...mode.pitches.slice(omit_pos+1)]
        let omitted = mode.pitches[omit_pos]
        let violate = edo.mod(omitted+man.violate[0],edo.edo)

        let transpose_1 = rand_int_in_range(-3,3)
        let transpose_2 = rand_int_in_range(-3,3)
        let transpose_3 = rand_int_in_range(-3,3)
        let probe_melody1 = make_probe(probe_pitches)
        let probe_melody2 = make_probe(probe_pitches)
        let probe_melody3 = make_probe(probe_pitches)
        let notes_not_in_last_quarter = probe_pitches.filter(n=>probe_melody1.slice(Math.floor(probe_melody1.length*0.75)).indexOf(n)==-1) //Not in last quarter
        notes_not_in_last_quarter = notes_not_in_last_quarter.filter(n=>n!=probe_melody1[0]) //or 1st note
        let random_in_melody = notes_not_in_last_quarter[rand_int_in_range(0,notes_not_in_last_quarter.length-1)]

        //Transpose probes
        probe_melody1 = probe_melody1.map(p=>p+transpose_1)
        probe_melody2 = probe_melody2.map(p=>p+transpose_2)
        probe_melody3 = probe_melody3.map(p=>p+transpose_3)



        stimuli.push({
            subject_id:subject_id,
            set: set.pitches,
            mode: i,
            mode_pitches: mode.pitches,
            probe_pitches: probe_pitches,
            omitted_pos: omit_pos,
            transposition: transpose_1,
            probe: probe_melody1,
            test: random_in_melody+transpose_1,
            type: "in_melody",
            practice: false
        })

        stimuli.push({
            subject_id:subject_id,
            set: set.pitches,
            mode: i,
            mode_pitches: mode.pitches,
            probe_pitches: probe_pitches,
            transposition: transpose_2,
            probe: probe_melody2,
            test: omitted+transpose_2,
            type: "in_set",
            practice: false
        })

        stimuli.push({
            subject_id:subject_id,
            set: set.pitches,
            mode: i,
            mode_pitches: mode.pitches,
            probe_pitches: probe_pitches,
            transposition: transpose_3,
            probe: probe_melody3,
            test: violate+transpose_3,
            type: "novel",
            practice: false
        })

    })
    stimuli = edo.shuffle_array(stimuli) //shuffle trials

    return stimuli


}





module.exports = make_stimuli


