<script>
    import WorkArea from "./components/WorkArea.svelte";
</script>


<WorkArea></WorkArea>

<footer>
    <img class="file-icon" src="./static/omdb-logo-footer.svg"/>
    <p>СПЕЦИАЛЬНО ДЛЯ FRANK BATTLE 2023</p>
</footer>

<style>
    
    footer {
        background-color: rgb(255, 255, 255);
        width: 100%;
        height: 200px;
        color: rgb(0, 0, 0);
        margin-top: 40px;
        display: flex;
        flex-flow: column;
        
    }

    footer img {
        height: 100px;
        width: auto;
    }

    footer p {
        width: 95%;
        background-color: black;
        margin-top: 40px;
        color: white;
        padding: 20px;
        border-radius: 10px 10px 0px 0px;
    }
</style>
