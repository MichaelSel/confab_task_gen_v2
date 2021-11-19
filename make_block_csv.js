const fs = require('fs');
const csv = require('csv-parser');

const make_block_csv = function (participant_id, participant_dir, block_num, stimuli) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    let data =stimuli.map((stim,i) => {
        let dat = {
            subject_id: stim.subject_id,
            question: stim.Q_num,
            block_num: block_num,
            set: stim.set,
            mode: stim.mode,
            mode_pitches:stim.mode_pitches,
            probe_pitches:stim.probe_pitches,
            transposition:stim.transposition,
            probe: stim.probe,
            test:stim.test,
            type:stim.type,
            probe_file:stim.probe_file,
            test_file:stim.test_file,
            practice:stim.practice

        }
        return dat
    })
    fs.writeFile(participant_dir + "csv/" + "block_" + block_num + ".json", JSON.stringify(data), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    const csvWriter = createCsvWriter({
        path: participant_dir + "csv/" + "block_" + block_num + ".csv",
        header: Object.keys(data[0]).map(el=>{return {id:el,title:el}})
    }).writeRecords(data)
        .then(()=> console.log("CSV file subject",participant_id,"block", block_num,"was successfully created."));
}

module.exports = make_block_csv