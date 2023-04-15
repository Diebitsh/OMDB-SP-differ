<script>
    import { fade } from 'svelte/transition';
    import UploadFiles from './UploadFiles.svelte';

    let sourceFile = null;
    let destFile = null;

    export let result = null;

    function makeMobile() {
        document.getElementById("main-view").style.width = "580px";
    }
    function makeDesktop() {
        document.getElementById("main-view").style.width = "100%";
    }
</script>

<div class="omdb-main-view-wrapper">
    <div class="omdb-mobile-or-desktop">
        <button on:click={makeMobile}>
            <img class="file-icon" src="./static/phone.svg" />
        </button>
        <button on:click={makeDesktop}>
            <img class="file-icon" src="./static/desktop.svg" />
        </button>
    </div>
    <div class="omdb-main-view" id="main-view">

    </div>
</div>

<style>
    .omdb-main-view-wrapper {
        width: 100%;
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-flow: column;
        background: radial-gradient(#00000013 5%, transparent 20%) 0 0, radial-gradient(rgb(0, 0, 0) 1%, transparent 1%) 50px 50px;
        background-size: 8px 8px;
    }

    .omdb-mobile-or-desktop {
        width: 100%;
        height: 40px;
        /* box-shadow: 0px 2px 3px 0px rgba(34, 60, 80, 0.6); */
        display: flex;
        align-items: center;
        justify-content: center;
        /* border-radius: 0px 0px 5px 5px; */
        background-color: #ffffff00;
    }

    .omdb-mobile-or-desktop button {
        margin-left: 20px;
        border: none;
        background-color: white;
        cursor: pointer;
        margin-left: 20px;
        margin-right: 20px;
    }

    .omdb-main-view {
        width: 100%;
        min-height: 96%;
        background-color: rgba(236, 236, 236, 0.705);
        transition: 0.3s ease-in-out;
    }

    .file-icon {
        height: 20px;
        width: auto;
    }
</style>