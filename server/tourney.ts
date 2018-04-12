let LICHESS_TOURNEY_URL=`https://lichess.org/tournament/new`
let LICHESS_TOURNEY_NAME=`ACT Discord Server`
let LICHESS_TOURNEY_WAIT_MINUTES=`20`

function createTourney(lila2:string,name:string,waitMinutes:string,time:string,inc:string,callback:any){
    console.log(`creating atomic tourney ${time}+${inc} wait ${waitMinutes}`)
    let form=new FormData_()    
    form.append("system","1");
    //form.append("isprivate","");
    form.append("password","");
    form.append("name",`${name}`);
    form.append("variant","7");
    form.append("position","rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    form.append("mode","1");
    form.append("waitMinutes",`${waitMinutes}`);
    form.append("clockTime",`${time}`);
    form.append("clockIncrement",`${inc}`);
    form.append("minutes","120");
    form.append("conditions.nbRatedGame.nb",100);
    form.append("conditions.nbRatedGame.perf","atomic");
    form.append("conditions.maxRating.rating","9999");
    form.append("conditions.maxRating.perf","atomic");
    form.append("conditions.minRating.rating","1800");
    form.append("conditions.minRating.perf","atomic");
    form.append("conditions.titled","false");
    //console.log(form)
    let headers={
        "Referer":`${LICHESS_TOURNEY_URL}`,
        'Cookie': `lila2=${lila2}`
    }
    //console.log(headers);
    fetch_((`${LICHESS_TOURNEY_URL}`),{
        method:"POST",
        headers:headers,
        redirect:"manual",
        body:form
    }).
    then((response:any)=>response.text()).
    then((content:any)=>callback(content))
}
