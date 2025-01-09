const dotenv = require('dotenv');
dotenv.config();
import app from "./app";

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`API Node.js rodando na porta ${PORT}`);
});


dotenv.config();




