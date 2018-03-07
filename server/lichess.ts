let LICHESS_USER:string=process.env.LICHESS_USER||""
let LICHESS_PASS:string=process.env.LICHESS_PASS||""

function login(user:string,pass:string,callback:any){
    console.log(`lichess login in with ${user}`)
    let form=new FormData_()
    form.append("username",user);
    form.append("password",pass);
    fetch_((`https://lichess.org/login?referrer=/`),{
        method:"POST",
        headers:{
            "Referer":"https://lichess.org/login?referrer=/"
        },
        redirect:"manual",
        body:form
    }).then((response:any)=>{
        console.log("response",response.headers.get("set-cookie"))
        let cookie=response.headers.get("set-cookie")
        let parts=cookie.split("=")
        parts.shift()
        parts=parts.join("=").split(";")
        let lila2=parts[0]                
        console.log(`obtained cookie: lila2=${lila2}`)
        callback(lila2)
    })
}