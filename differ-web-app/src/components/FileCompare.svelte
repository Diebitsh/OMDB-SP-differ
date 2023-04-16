<script>
    import { fade } from 'svelte/transition';
    
    export let result;
</script>

<div class="omdb-main-view-wrapper">
    <div class="omdb-main-view" id="main-view">
        {@html result}
    </div>
</div>
<style>
    .omdb-main-view-wrapper {
        width: 100%;
        min-height: 100%;
        background-color: rgb(80, 255, 103);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-flow: column;
    }

    .omdb-main-view {
        width: 100%;
        min-height: 96%;
        background-color: rgb(71, 74, 255);
        transition: 0.3s ease-in-out;
    }
</style>