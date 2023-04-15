<script>
    import UploadFiles from "./UploadFiles.svelte";
    import DomCompare from "./DomCompare.svelte";
    import FileCompare from "./FileCompare.svelte";

    //import { sourceFile } from "./UploadFiles.svelte";

    const views = [UploadFiles, DomCompare, FileCompare];

    let mainView = null;
    let currentView = 0;

    function updateMainView() {
        mainView = views[currentView];
    }

    function goToUpload() {
        currentView = 0
        sourceFile = null;
        destFile = null;
        updateMainView()
    }

    function goToDomDiffer() {
        currentView = 1
        updateMainView()
    }

    function goToFileDiffer() {
        currentView = 2
        updateMainView()
    }

    updateMainView()

    let sourceFile = null;
    let destFile = null;
    let isWithStyle = false;

    let sourceFileText = null;
    let destFileText = null;
    let isStyleContains = false;

    let result;

    async function castHtmlFileToTextPlain(file) {
        const reader = new FileReader()
        const promise = new Promise(resolve => {
        reader.onload = ev => {
            resolve(ev.target.result)
        }
            reader.readAsText(file)
        });

        return await Promise.resolve(promise);
    }

    //отсылает json с текстом из двух файлов и полем если должен содержаться стиль. Если стиль должен быть конкотинируем поля стиля и боди и вставляем как innerhtml
    //иначе только боди как  innerhtml
    async function compareFilesRequest(addres) {
        const res = await fetch(addres, {
            method: 'POST',
            body: JSON.stringify({
                sourceFileText,
                destFileText,
                isStyleContains
            })
        });

        const jsonResult = await res.json();
        result = json;
    }


    //преобразовать файлы в плэинтекст
    function comapreDomWithStyles(isWithStyle) {
        if (sourceFile === null || destFile === null) {
            document.getElementById("validate").style.display = "block"
            return;
        }
        else {
            
            sourceFileText = castHtmlFileToTextPlain(sourceFile[0]);
            destFileText = castHtmlFileToTextPlain(destFile[0]);
            isStyleContains = isWithStyle;

            goToDomDiffer()

            compareFilesRequest('http://localhost:80/api/compare');
        }
    }

    function comapreFiles() {
        if (sourceFile === null || destFile === null) {
            document.getElementById("validate").style.display = "block"
            return;
        }
        else {
            
            sourceFileText = castHtmlFileToTextPlain(sourceFile[0]);
            destFileText = castHtmlFileToTextPlain(destFile[0]);
            isStyleContains = isWithStyle;

            goToFileDiffer()

            compareFilesRequest('http://localhost:80/api/compare-text');
        }
    }

    function closeValidate() {
        document.getElementById("validate").style.display = "none"
    }

    function toggleStatistics() {
        const menu = document.getElementById("stat-menu");
        const elem = document.getElementsByClassName("stat-block-name");
        if (menu.style.width >= "24%") {
            menu.style.width = "0%"
            for (let i =0; i <elem.length; i++){
                elem[i].style.display = "none";
            } 
        }
        else {
            menu.style.width = "25%"
            for (let i =0; i <elem.length; i++){
                elem[i].style.display = "block";
            } 
        }
    }

</script>

<workarea>
    <!-- <div>
        
        <form action="http://localhost:80/api/compare" enctype="multipart/form-data" on:submit|preventDefault={handleSubmit}>
    
            <label for="src">Старый файл</label>
            <input id="src" name="src" type="file" accept=".html" required>
    
            <label for="dest">Новый файл</label>
            <input id="dest" name="dest" type="file" accept=".html" required>
            
            <input type="submit" value="Сравнить" />
        </form>
    
    </div>
    
    {@html resultHtml} -->

    <div  id="validate" style="display: none;" >
        <div class="omdb-validate">
            <p>Файлы не загружены</p>
            <span><img on:click={closeValidate} class="file-icon" src="./static/close-btn.svg" /></span>
        </div>
    </div>

    <div class="omdb-work-area-wrapper">
        <div class="omdb-buttons-area-wrapper">
            <div class="omd-button-area">
                <div class="omdb-stat-toggle">
                    <button on:click={toggleStatistics}>
                        <img class="file-icon" src="./static/menu.svg"/>
                    </button>
                    <button on:click={goToUpload}>
                        <img class="file-icon" src="./static/reload.svg"/>
                    </button>
                </div>
                <div class="omdb-main-inputs">
                    <button class="omdb-diff-func" on:click={comapreDomWithStyles}>
                        <img class="file-icon" src="./static/compare-dom.svg" />
                        <p></p>
                    </button>
                    <button class="omdb-diff-func" on:click={comapreDomWithStyles}>
                        <img class="file-icon" src="./static/compare-no-styles.svg"/>
                        <p></p>
                    </button>
                    <button class="omdb-diff-func" on:click={comapreFiles}>
                        <img class="file-icon" src="./static/code.svg" />
                        <p></p>
                    </button>
                </div>
            </div>
        </div>
        <div class="omdb-main-area">
            <div class="omdb-statistics-wrapper" id="stat-menu">
                <div class="omdb-statistics">
                    <p class="stat-block-name">Файлы</p>
                    <div class="omdb-stat-block omdb-files-name">
                        <div class="omdb-stat-block-container">
                            <p class="omdb-stat-file-names">{#if sourceFile}SOURCE: {sourceFile[0].name}{:else }SOURCE: ФАЙЛ НЕ ЗАГРУЖЕН{/if}</p>
                            <p class="omdb-stat-file-names">{#if destFile}DESTINATION: {destFile[0].name}{:else }DESTINATION: ФАЙЛ НЕ ЗАГРУЖЕН{/if}</p>
                        </div>
                    </div>
                    <p class="stat-block-name">Изменено</p>
                    <div class="omdb-stat-block omdb-modified-stat">
                        <div class="omdb-stat-block-container">

                            <div class="omdb-tag omdb-modified-tag">
                                <p class="omdb-tag-line">
                                    <span class="tag-name">A</span>
                                    <span class="file-name">1-dst.html</span>
                                </p>
                            </div>

                        </div>
                    </div>
                    <p class="stat-block-name">Добавлено</p>
                    <div class="omdb-stat-block omdb-added-stat">
                        <div class="omdb-stat-block-container">

                            <div class="omdb-tag omdb-added-tag">
                                <p class="omdb-tag-line">
                                    <span class="tag-name">A</span>
                                    <span class="file-name">1-dst.html</span>
                                </p>
                            </div>

                        </div>
                    </div>
                    <p class="stat-block-name">Удалено</p>
                    <div class="omdb-stat-block omdb-delted-stat">
                        <div class="omdb-stat-block-container">

                            <div class="omdb-tag omdb-deleted-tag">
                                <p class="omdb-tag-line">
                                    <span class="tag-name">A</span>
                                    <span class="file-name">1-dst.html</span>
                                </p>
                            </div>
                            
                        </div>
                    </div>
                    <p class="stat-block-name">Дополнительно</p>
                    <div class="omdb-stat-block omdb-time-stat">
                        <div class="omdb-stat-block-container">
                            <p class="omdb-stat-file-names">{#if sourceFile}{sourceFile[0].name}   ({sourceFile[0].size} байт){/if}</p>
                            <p class="omdb-stat-file-names">{#if destFile}{destFile[0].name}   ({destFile[0].size} байт){/if}</p>
                        </div>
                    </div>
                </div>

            </div>
            
            <!-- {#if mainView == views[currentView]}
                <svelte:component this={mainView} ></svelte:component>
            {/if} -->
            {#if currentView == 0}
            <UploadFiles bind:sourceFile bind:destFile></UploadFiles>
            {:else if currentView == 1}
            <DomCompare bind:result></DomCompare>
            {:else}
            <FileCompare bind:result></FileCompare>
            {/if}
        </div>
    </div>
</workarea>

<style>
    workarea {
        /*background-color: bisque;*/
        min-height: 100%;
        width: 100%;
        padding-top: 10px;
        padding-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-flow: column;
        background-color: #ffffff;
    }

    .omdb-validate {
        width: 95%;
        background-color: #fed6d6;
        color: black;
        font-size: 16px;
        font-weight: bold;
        padding: 20px;
        margin-bottom: 10px;
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .omdb-validate span img {
        height: 20px;
        width: auto;
        cursor: pointer;
    }

    .omdb-work-area-wrapper {
        min-height: 98%;
        min-width: 99%;
        /*background-color: aqua;*/
    }

    .omdb-buttons-area-wrapper {
        width: 100%;
        height: 80px;
        box-shadow: 0px 0px 3px 0px rgba(34, 60, 80, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px 5px 0px 0px;
        background-color: #ffffff;
    }

    .omd-button-area {
        height: 90%;
        width: 99%;
        /*background-color: greenyellow;*/
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .omd-button-area button {
        width: 40px;
        height: 40px;
        outline: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        border: 1px solid #0F62FE;
        border: none;
        border-radius: 3px;
        transition: 0.3s;
        cursor: pointer;
    }

    .omdb-diff-func:hover {
        transform: translateY(-4px);
    }

    .omd-button-area button img {
        height: 30px;
        width: auto;
    }

    .omdb-stat-toggle {
        width: 25%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    .omdb-stat-toggle button {
        margin-left: 20px;
    }

    .omdb-main-inputs {
        width: 75%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .omdb-main-inputs button {
        margin-right: 120px;
        text-align: left;
    }

    .omdb-main-inputs p {
        margin-left: 20px;
        transition: 0.3s ease-in;
    }

    .omdb-main-area {
        min-height: 900px;
        width: 100%;
        /*background-color: rgb(255, 54, 148);*/
        display: flex;
    }

    .omdb-statistics-wrapper {
        min-height: 100%;
        background-color: #ffffff;
        width: 0%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:  8px 0px 6px -10px rgba(0, 0, 0, 0.84);
        color: #696969;

    }

    .omdb-statistics {
        width: 95%;
        height: 99%;
        background-color: rgba(221, 221, 221, 0);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-flow: column;
    }

    .omdb-stat-block {
        height: 25%;
        width: 100%;
        background-color: rgba(255, 255, 255, 0);
        margin: 1px;
        overflow-x: hidden;
    }

    .stat-block-name {
        margin-top: 5px;
        margin-bottom: 5px;
        margin-left: 15px;
        padding: 5px;
        border-top: 1px solid rgb(226, 226, 226);
        border-bottom: 1px solid rgb(226, 226, 226);
        font-weight: 600;
        width: 90%;
        display: none;
    }

    .omdb-stat-block-container {
        width: 100%;
        min-height: 75%;
        background-color: rgba(0, 255, 255, 0);
        overflow-y: auto;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
    }

    .omdb-stat-block::-webkit-scrollbar-track
    {
        border-radius: 10px;
        background-color: #f5f5f500;
        width: 5px;
        height: 10px;
    }

    .omdb-stat-block::-webkit-scrollbar
    {
        width: 12px;
        background-color: #f5f5f500;
        width: 5px;
        height: 10px;
        cursor: pointer;
    }

    .omdb-stat-block::-webkit-scrollbar-thumb
    {
        border-radius: 10px;
        background-color: rgba(226, 226, 226, 0.349)
    }

    .omdb-files-name {
        height: 15%;
        margin-top: 0px;
    }

    .omdb-time-stat {
        height: 10%;
    }

    .omdb-stat-file-names {
        font-weight: bold;
        width: 100%;
        font-size: 12px;
        margin-left: 5px;
        background-color: #f4f4f4;
        padding: 10px;
        border-radius: 20px;
        margin-top: 10px;
    }

    .omdb-tag {
        background-color: #0F62FE;
        padding: 10px;
        border-radius: 100px;
        margin-top: 10px;
        margin-left: 10px;
        color: black;
        font-weight: bold;
        font-size: 12px;
    }

    .tag-name {
        padding-right: 10px;
        border-right: 2px solid black;
    }

    .file-name {
        margin-left: 10px;
    }

    .omdb-modified-tag {
        background-color: #e8dbfa;
    }

    .omdb-added-tag {
        background-color: #a7f0b8;
    }

    .omdb-deleted-tag {
        background-color: #fed9d6;
    }
</style>