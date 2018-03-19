let LICHESS_TOURNEY_URL=`https://lichess.org/tournament/new`
let LICHESS_TOURNEY_NAME=`ACT Discord Server`
let LICHESS_TOURNEY_WAIT_MINUTES=`20`

function createTourney(lila2:string,time:number,inc:number,callback:any){
    console.log(`creating atomic tourney ${time}+${inc}`)
    let form=new FormData_()    
    form.append("system","1");
    //form.append("isprivate","");
    form.append("password","");
    form.append("name",`${LICHESS_TOURNEY_NAME}`);
    form.append("variant","7");
    form.append("position","rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    form.append("mode","1");
    form.append("waitMinutes",`${LICHESS_TOURNEY_WAIT_MINUTES}`);
    form.append("clockTime",`${time}`);
    form.append("clockIncrement",`${inc}`);
    form.append("minutes","110");
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
