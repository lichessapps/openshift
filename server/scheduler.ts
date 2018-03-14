let TOURNEY_SCHEDULE:{[id:number]:number[]}={
    0:[1,0],
    10:[3,2],
    20:[2,0],
    30:[5,0],
    40:[7,2],
    50:[3,0]
}

function scheduleTourneys(){

    for(let key in TOURNEY_SCHEDULE){
        let value=TOURNEY_SCHEDULE[key]
        let time=value[0]
        let inc=value[1]
        console.log(`scheduler schedule tourney ${key} ${time} ${inc}`)        
        schedule.scheduleJob(`${key} * * * *`, function(){
            console.log(`scheduler create tourney ${time} ${inc}`)        
            login(LICHESS_USER,LICHESS_PASS,(lila2:string)=>{
                console.log(`login ok`)
                createTourney(lila2,time,inc,(content:any)=>{
                    //console.log(content)
                })
            })
        })
    }

}

if(isProd()) scheduleTourneys()

