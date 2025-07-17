const bcrypt = require('bcrypt'); 
const pool = require('./db');

app.post('/signup', async (req, res) => {
    const {username, email, password} = req.body
    try{
        const hashedPassword = await bcrypt.hash(password, 12)

        await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        )

        res.status(201).send('User created')
    } catch (err) {
        console.log(err)
        res.status(500).send('Sign Up Failed Error: 500')
    }
})

app.post('/login', async (req, res) => {
    const {email, password} = req.body

    try{
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

        if(result.rows.length === 0){
            return res.status(400).send('Invaild Email or Password, Please Try Again')
        }

        const user = result.rows[0]

        const validPassword = await bcrypt.compare(password, user.password)

        if(!validPassword) {
            return res.status(400).send('Invaild Email or Password, Please Try Again')
        }

        req.session.userId = user.id

        res.send('Logged In Successfully')

    } catch (err) {
        console.error(err)
        res.status(500).send('Login Failed')
    }
})