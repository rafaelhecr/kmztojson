import React            from 'react';
import PropTypes        from 'prop-types';


class DragFiles extends React.Component {
   static get contextTypes() {
    return {
        store: PropTypes.object.isRequired
    }
  }
  constructor(props,context){
    super(props,context);
    this.context = context;
    this.store   = this.context.store;

    this.state = {
      files : [],
      uploading:false
    }
  }
  size(bytes){
   if(bytes === 0) return '0 Bytes';
   let k = 1000,
       dm = 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  onDragEnter(e){
    e.preventDefault()
    e.stopPropagation()
    this.refs.container.classList.add('notify-drop-hover')
    this.refs.message.innerHTML = 'Drop files here'
  }
  onDragLeave(e){
    e.preventDefault()
    e.stopPropagation()
    this.refs.container.classList.remove('notify-drop-hover')
    this.refs.message.innerHTML = ''
  }
  onDragOver(e){
    e.preventDefault()
    e.stopPropagation()
    this.refs.container.classList.add('notify-drop-hover')
    this.refs.message.innerHTML = 'Drop files here'

  }
  onDrop(e){
    e.preventDefault()
    e.stopPropagation()
    var response;
    var props = this.props;
    var reader = new FileReader();
    this.files = e.target.files || e.dataTransfer.files
    console.log(e.dataTransfer.files[0])
    reader.readAsDataURL(e.dataTransfer.files[0]);
    reader.addEventListener('load', function(e,file){
       var bin = reader.result;
      //  console.log(bin)
      response={
        url: bin,
      }
      // props.dispatch(setCurrentStationImage(response));
    })

    this.refs.container.classList.remove('notify-drop-hover')
    this.refs.message.innerHTML = ''
    if(this.props.setFile){
      this.props.setFile(this.files)
    }
    if( this.allowTypeFiles() ){
      this.setFiles()
    }

  }
  allowTypeFiles(){
    let errors = [];
    if(this.props.allow){
      let allow = this.props.allow.split(',');
      for( let x in this.files){
        if( typeof this.files[x]  === 'object'){
          let mime = this.files[x].type.split('/')[1];
          if(allow.indexOf(mime) === -1 ){
            errors.push(this.files[x])
          }
        }
      }
    }
    if(errors.length > 0){
      if(this.props.onFailedType){
        this.props.onFailedType(errors)
      }
      return false;
    }else{
      return true;
    }
  }
  setFiles(){
    let files = this.state.files.length ?  this.state.files : [];
    for( let x in this.files){
      if( typeof this.files[x]  === 'object'){
        let file = this.files[x]
        files.push(file)
      }
   }
    this.setState({files:files,uploading:true})
     if(this.props.onBeforeUpload){
      this.props.onBeforeUpload(files,this.index)
      }
      if(!this.state.uploading){
        this.index = 0;
      }
  }
  onProgress(e){
    let percent = 0;
    if (e.lengthComputable) {
      percent = Math.round(e.loaded * 100 / e.total);
      this.props.onFileProgress(percent, this.index)
    }
  }
  upload(){
    // files
    let file = this.state.files[this.index];
    if(this.props.onStartFileUpload){
      this.props.onStartFileUpload(this.index)
    }
    let xhr = new XMLHttpRequest()
    xhr.timeout = 0;

    if(this.props.onFileProgress){
      xhr.upload.addEventListener("progress", this.onProgress.bind(this)  ,false)
    }

    if (xhr.upload) {
      let formData = new FormData();
      formData.set("index", this.index);
      if(this.props.params){
        for( let i in this.props.params){
          formData.set(i, this.props.params[i])
        }
      }
      formData.set("file", file);

      // start upload
      xhr.open("POST",this.props.service, true)

      if( this.props.params && this.props.params.authToken){
        xhr.setRequestHeader("Authorization", `bearer ${this.props.params.authToken}`)
      }

      xhr.send(formData)
      xhr.ontimeout = function (e) {
        console.log('timeout->',e)
      }
      xhr.onreadystatechange = (()=>{
        if (xhr.readyState === 4 && xhr.status === 200 ){
          if(xhr.responseText){
            let data     = JSON.parse(xhr.responseText+'')
            if(this.props.onFileSuccess){
              this.props.onFileSuccess(data.file,this.index)
            }

            this.index = data.idx + 1;
            if(this.index < this.state.files.length ){
              this.upload();
            }

            if(this.index === this.state.files.length ){
              this.props.onComplete(this.state.files);
              if(this.props.resetOnComplete){
                setTimeout(()=>{
                  this.setState({files:[],uploading:false})
                },600)

              }
            }
          }
        }
      })
    }
  }

  render(){
    return(
      <div
        onClick={()=>{
          // this.refs.fileUploader.click();
        }}
        className={this.props.className}
        onDragEnter={this.onDragEnter.bind(this)}>

        <input onChange={this.onDrop.bind(this)} type="file" ref="fileUploader" style={{display: "none"}} />
        <div
          ref="container"
          className="d-flex align-items-center justify-content-center "
          onDragLeave={this.onDragLeave.bind(this)}
          onDragOver={this.onDragOver.bind(this)}
          onDrop={this.onDrop.bind(this)}>

        <div
          ref="message"
          className="container
          notify-message
          d-flex
          align-items-center
          justify-content-center"></div>

      </div>
      {this.props.children}
    </div>
    )
  }
}

export default DragFiles