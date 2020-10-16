<template>
    <div class="create-puzzle">
        <h2>Choose preset</h2>
        <v-divider class="ma-4"></v-divider>
        <div class="cards">
            <v-card v-for="preset in presets">
                <v-img src="../assets/sudoku.png"
                       height="200px"
                       width="300px"></v-img>
                <v-card-title>{{preset.name}}</v-card-title>
                <v-card-subtitle>{{preset.description}}</v-card-subtitle>
                <v-card-actions>
                    <v-btn :to="`/create/${preset.id}`" color="primary" text>Choose preset</v-btn>
                </v-card-actions>
            </v-card>
        </div>
    </div>
</template>

<script>
    export default {
        name: "CreatePuzzle",
        components: {},
        data: () => ({
            presets: [
                {
                    name: 'Sudoku',
                    description: 'Start out with classic sudoku constraints.',
                    id: 'sudoku',
                    options: {
                        Width: {selected: 9, values: [4, 9, 16]},
                        Height: {selected: 9, values: [4, 9, 16]},
                    },
                },
            ]
        }),
        mounted() {
        },
        methods: {},
        watch: {},
        computed: {},
    }
</script>

<style scoped>
    .create-puzzle {
        padding: 20px;
    }

    .cards {
        display: flex;
    }
</style>