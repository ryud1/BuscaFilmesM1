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
        const [omdbResponse, tmdbResponse] = await axios.all([
            axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(titulo)}&y=${ano}&apikey=${OMDB_API_KEY}`),
            axios.get(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(titulo)}&year=${ano}&api_key=${TMDB_API_KEY}&language=pt-BR`)
        ]);

        const omdbData = omdbResponse.data;
        if (omdbData.Response === "False") {
            return res.status(404).json({ erro: "Filme não encontrado no OMDb" });
        }

        const tmdbData = tmdbResponse.data.results.length ? tmdbResponse.data.results[0] : null;
        if (!tmdbData) {
            return res.status(404).json({ erro: "Filme não encontrado no TMDb" });
        }

        // Buscar as reviews do filme no TMDb
        let reviews = [];
        try {
            const tmdbReviewsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbData.id}/reviews?api_key=${TMDB_API_KEY}&language=pt-BR`);
            reviews = tmdbReviewsResponse.data.results.slice(0, 3).map(review => ({
                autor: review.author,
                conteudo: review.content
            }));
        } catch (error) {
            console.warn("Erro ao buscar reviews, retornando sem elas:", error.message);
        }

        res.json({
            nome: omdbData.Title,
            ano: omdbData.Year,
            sinopse: omdbData.Plot,
            imagem: omdbData.Poster,
            reviews
        });

    } catch (error) {
        console.error("Erro ao buscar informações:", error.message);
        res.status(500).json({ erro: "Erro ao buscar informações do filme" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
