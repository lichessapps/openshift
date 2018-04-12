// server startup

const app = express()

app.use(morgan('combined'))
app.use(express.static('server/assets'))

app.get('/', (req:any, res:any) => res.sendFile(path.join(__dirname,'pages/index.html')))

//app.listen(PORT, () => console.log(`lichessapps server listening on ${PORT}`))

login(LICHESS_USER,LICHESS_PASS,(lila2:string)=>{
    console.log(`login ok`)
    createTourney(lila2,process.argv[2],process.argv[3],process.argv[4],process.argv[5],(content:any)=>{
        console.log("tourney creation returned")
        //console.log(content)
    })
})