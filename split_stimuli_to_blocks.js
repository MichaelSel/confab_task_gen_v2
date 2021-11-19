const split_stimuli_to_blocks = function (stimuli,num_of_blocks) {
    const Q_per_block = Math.ceil(stimuli.length/num_of_blocks)
    let blocks = []
    for (let i = 0; i < stimuli.length; i+=Q_per_block) {
        let stim_slice = stimuli.slice(i,i+Q_per_block)
        blocks.push(stim_slice)
    }
    blocks.forEach((block,i)=>{
        block.forEach(q=>q.block=i+1)
    })
    return blocks
}

module.exports = split_stimuli_to_blocks