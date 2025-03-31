require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));
app.use(cors());
app.use(express.json());

const OMDB_API_KEY = "b93399e3";
const TMDB_API_KEY = "5a2b4a28c5fe1cda4c70a8c6d195c081";

app.get("/buscar-filme", async (req, res) => {
    const { titulo, ano } = req.query;

    if (!titulo) {
        return res.status(400).json({ erro: "O título do filme é obrigatório" });
    }

    try {
        const omdbData = "";
        const tmdbData = "";
        const reviews = "";

        axios.all([
            axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(titulo)}&y=${ano}&apikey=${OMDB_API_KEY}`),
            axios.get(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(titulo)}&year=${ano}&api_key=${TMDB_API_KEY}&language=pt-BR`),
            axios.get(`https://api.themoviedb.org/3/movie/${tmdbData.id}/reviews?api_key=${TMDB_API_KEY}&language=pt-BR`)
        ]).then(axios.spread((omdbResponse, tmdbResponse, tmdbReviewsResponse) => {
                omdbData = omdbResponse.data;
                tmdbData = tmdbResponse.data.results.length ? tmdbResponse.data.results[0] : null;
                reviews = tmdbReviewsResponse.data.results.slice(0, 3).map(review => ({
                    autor: review.author,
                    conteudo: review.content
                }));
        }));

        if (omdbData.Response === "False") {
            return res.status(404).json({ erro: "Filme não encontrado no OMDb" });
        }

        if (!tmdbData) {
            return res.status(404).json({ erro: "Filme não encontrado no TMDb" });
        }

        const imageUrl = omdbData.Poster;

        res.json({   
            nome: omdbData.Title,
            sinopse: omdbData.Plot,
            imagem: imageUrl,
            reviews
        });
    } catch (error) {
        console.error("Erro ao buscar informações:", error);
        res.status(500).json({ erro: "Erro ao buscar informações do filme" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
