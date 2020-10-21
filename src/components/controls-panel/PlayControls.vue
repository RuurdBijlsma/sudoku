<template>
    <div class="controls">
        <custom-expando name="Visuals" :default-show="false">
            <visual-options></visual-options>
        </custom-expando>
        <custom-expando name="Constraints" :default-show="false">
            <constraints-list editable></constraints-list>
        </custom-expando>
        <custom-expando name="Inputs">
            <sudoku-inputs></sudoku-inputs>
        </custom-expando>
    </div>
</template>

<script>
    import CustomExpando from "@/components/CustomExpando";
    import SudokuInputs from "@/components/controls-panel/SudokuInputs";
    import VisualOptions from "@/components/controls-panel/VisualOptions";
    import ConstraintsList from "@/components/controls-panel/ConstraintsList";


    export default {
        name: "PlayControls",
        components: {ConstraintsList, VisualOptions, SudokuInputs, CustomExpando}
    }
</script>

<style scoped>
    .controls {
        min-width: 230px;
        width: 230px;
        display: flex;
        flex-direction: column;
    }
</style>