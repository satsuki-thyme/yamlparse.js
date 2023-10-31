function yamlparse(rawYaml) {
  let splYaml = rawYaml.split(/\r?\n/)
  let procYaml = []
  let meaning = []
  for (let i in splYaml) {
    if (/^[ \t]*(?<!\\)#.*$/.test(splYaml[i])) {
      meaning[i] = `comment`
    }
    else if (/^[ \t]*$/.test(splYaml[i])) {
      meaning[i] = `blank`
    }
    else {
      meaning[i] = `effect`
    }
  }
  let indentVal = []
  for (let i in splYaml) {
    if (meaning[i] === `effect`) {
      indentVal[i] = splYaml[i].match(/^[ \t]*/)[0].length
    }
    else {
      indentVal[i] = 0
    }
  }
  let indentDiff = {}
  for (let i = 1; i < indentVal.length; i++) {
    if (indentVal[i - 1] < indentVal[i]) {
      if (indentDiff[indentVal[i] - indentVal[i - 1]]) {
        indentDiff[indentVal[i] - indentVal[i - 1]]++
      }
      else {
        indentDiff[indentVal[i]] = 1
      }
    }
  }
  let mode = Object.keys(indentDiff)[0]
  for (let i = 1; i < Object.keys(indentDiff).length; i++) {
    if (indentDiff[Object.keys(indentDiff)[i]] > indentDiff[Object.keys(indentDiff)[i - 1]]) {
      mode = Number(Object.keys(indentDiff)[i])
    }
  }
  let indentNum = []
  for (let i in indentVal) {
    if (meaning[i] === `effect`) {
      indentNum[i] = Math.round(indentVal[i] / mode)
    }
    else {
      indentNum[i] = 0
    }
  }
  let prevEffectIndentNum = 0
  for (let i = 0; i < indentNum.length; i++) {
    /*
    #######    #######    #######    #######     ######    ######## 
    ##         ##         ##         ##         ##            ##    
    #####      #####      #####      #####      ##            ##    
    ##         ##         ##         ##         ##            ##    
    #######    ##         ##         #######     ######       ##    
    */
    if (meaning[i] === `effect`) {
      let diff = indentNum[i] - prevEffectIndentNum
      prevEffectIndentNum = indentNum[i]
      if (i > 0 && i < splYaml.length - 1) {
        if (diff > 0) {
          procYaml[i] = `${`\n<div>`.repeat(diff)}\n${splYaml[i].replace(/^[ \t]*/m, ``)}`
        }
        if (diff === 0) {
          procYaml[i] = `\n<br>\n${splYaml[i].replace(/^[ \t]*/, ``)}`
        }
        if (diff < 0) {
          procYaml[i] = `${`\n</div>`.repeat(-diff)}\n${splYaml[i].replace(/^[ \t]*/, ``)}`
        }
      }
      if (i === 0 && i < splYaml.length - 1) {
        procYaml[i] = `${`\n<div>`.repeat(indentNum[i] + 1)}\n${splYaml[i].replace(/^[ \t]*/, ``)}`
      }
      if (i > 0 && i === splYaml.length - 1) {
        procYaml[i] = `${`\n</div>`.repeat(indentNum[i] + 1)}\n${splYaml[i].replace(/^[ \t]*/, ``)}\n</div>`
      }
      if (splYaml.length === 1) {
        procYaml[i] = splYaml[i].replace(/^[ \t]*/, ``)
      }
    }
    /*
    ######     ##          #####     ###    ##    ##   ## 
    ##   ##    ##         ##   ##    ####   ##    ##  ##  
    ######     ##         #######    ## ##  ##    #####   
    ##   ##    ##         ##   ##    ##  ## ##    ##  ##  
    ######     #######    ##   ##    ##   ####    ##   ## 
    */
    if (meaning[i] === `blank`) {
      if (i > 0 && i < splYaml.length - 1) {
        if (meaning[i - 1] === `blank` && meaning[i + 1] === `blank`) {
          procYaml[i] = `\n<br>`
        }
        if (meaning[i - 1] !== `blank` && meaning[i + 1] === `blank`) {
          procYaml[i] = `\n<div>\n<br>`
        }
        if (meaning[i - 1] === `blank` && meaning[i + 1] !== `blank`) {
          procYaml[i] = `\n<br>\n</div>`
        }
        if (meaning[i - 1] !== `blank` && meaning[i + 1] !== `blank`) {
          procYaml[i] = `\n<div>\n<br>\n</div>`
        }
      }
      if (i === 0 && i < splYaml.length - 1) {
        if (meaning[i + 1] === `blank`) {
          procYaml[i] = `\n<div>\n<br>`
        }
        if (meaning[i + 1] !== `blank`) {
          procYaml[i] = `\n<div>\n<br>\n</div>`
        }
      }
      if (i > 0 && i === splYaml.length - 1) {
        if (meaning[i - 1] === `blank`) {
          procYaml[i] = `\n<br>\n</div>`
        }
        if (meaning[i - 1] !== `blank`) {
          procYaml[i] = `\n<div>\n<br>`
        }
      }
      if (splYaml.length === 1) {
        procYaml[i] = `<div>\n<br>\n</div>`
      }
    }
    /*
     ######     ######     ###    ###    ###    ###    #######    ###    ##    ######## 
    ##         ##    ##    ####  ####    ####  ####    ##         ####   ##       ##    
    ##         ##    ##    ## #### ##    ## #### ##    #####      ## ##  ##       ##    
    ##         ##    ##    ##  ##  ##    ##  ##  ##    ##         ##  ## ##       ##    
     ######     ######     ##      ##    ##      ##    #######    ##   ####       ##    
    */
    if (meaning[i] === `comment`) {
      if (i > 0 && i < splYaml.length - 1) {
        if (meaning[i - 1] === `comment` && meaning[i + 1] === `comment`) {
          procYaml[i] = `\n${splYaml[i]}`
        }
        if (meaning[i - 1] !== `comment` && meaning[i + 1] === `comment`) {
          procYaml[i] = splYaml[i].replace(/^([ \t]*(?<!\\)#.*)/, `\n<pre>$1`)
        }
        if (meaning[i - 1] === `comment` && meaning[i + 1] !== `comment`) {
          procYaml[i] = splYaml[i].replace(/^([ \t]*(?<!\\)#.*)/, `\n$1</pre>`)
        }
        if (meaning[i - 1] !== `comment` && meaning[i + 1] !== `comment`) {
          procYaml[i] = splYaml[i].replace(/^([ \t]*(?<!\\)#.*)/, `\n<pre>$1</pre>`)
        }
      }
      if (i === 0 && i < splYaml.length - 1) {
        if (meaning[i + 1] === `comment`) {
          procYaml[i] = splYaml[i].replace(/^([ \t]*(?<!\\)#.*)/, `\n<pre>$1`)
        }
        if (meaning[i + 1] !== `comment`) {
          procYaml[i] = splYaml[i].replace(/^([ \t]*(?<!\\)#.*)/, `\n<pre>$1</pre>`)
        }
      }
      if (i > 0 && i === splYaml.length - 1) {
        if (meaning[i - 1] === `comment`) {
          procYaml[i] = splYaml[i].replace(/^([ \t]*(?<!\\)#.*)/, `\n$1</pre>`)
        }
        if (meaning[i - 1] !== `comment`) {
          procYaml[i] = splYaml[i].replace(/^([ \t]*(?<!\\)#.*)/, `\n<pre>$1</pre>`)
        }
      }
      if (splYaml.length === 1) {
        procYaml[i] = splYaml[i].replace(/^([ \t]*(?<!\\)#.*)/, `\n<pre>$1</pre>`)
      }
    }
    /*
    ###    ##     ######     ########        #######    #######    #######    #######     ######    ######## 
    ####   ##    ##    ##       ##           ##         ##         ##         ##         ##            ##    
    ## ##  ##    ##    ##       ##           #####      #####      #####      #####      ##            ##    
    ##  ## ##    ##    ##       ##           ##         ##         ##         ##         ##            ##    
    ##   ####     ######        ##           #######    ##         ##         #######     ######       ##    
    */
    if (meaning[i] !== `effect`) {
      if (i > 0 && i < splYaml.length - 1) {
        if (meaning[i - 1] === `effect` && meaning[i + 1] !== `effect`) {
          procYaml[i] = `${`\n</div>`.repeat(prevEffectIndentNum)}${procYaml[i]}`
        }
        if (meaning[i - 1] !== `effect` && meaning[i + 1] === `effect`) {
          procYaml[i] = `${procYaml[i]}${`\n<div>`.repeat(prevEffectIndentNum)}`
        }
        if (meaning[i - 1] === `effect` && meaning[i + 1] === `effect`) {
          procYaml[i] = `${`\n</div>`.repeat(prevEffectIndentNum)}${procYaml[i]}${`\n<div>`.repeat(prevEffectIndentNum)}`
        }
      }
      if (i > 0 && i === splYaml.length - 1) {
        if (i > 0 && i < splYaml.length - 1) {
          if (meaning[i - 1] === `effect`) {
            procYaml[i] = `${`\n</div>`.repeat(prevEffectIndentNum)}${procYaml[i]}`
          }
        }
      }
    }
  }
  return procYaml
  .join(``)
  .replace(/^(- )?(\d+):/gm, `$1<span class="number">$2</span>:`)
  .replace(/^(.*?)(?<!\\):([ \t]*.*$|[ \t]*#.*$)/gm, `<span class="key">$1</span>:$2`)
  .replace(/(?<=^.*?):([ \t]*)(?=.*$)/gm, `<span class="colon">:</span>$1`)
  .replace(/^(.*?)- /gm, `$1<span class="bullet">-</span> `)
  .replace(/(#.*)$/gm, `<span class="comment">$1</span>`)
  .replace(/(?<=:.*?[ \t]+)\|/g, `<span class="vertical-bar">|</span>`)
}
