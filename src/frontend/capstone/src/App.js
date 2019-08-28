import React from 'react';
import { Layout, Menu, Icon, Row, Col, message} from 'antd';
import { List, Avatar } from 'antd';
import axios from 'axios';
import _ from 'lodash';
import SelectionArea from './components/SelectionArea';
import SearchArea from './components/SearchArea';

import { Input , Button} from 'antd';

const Search = Input.Search;

let data = [];

let searchBy = '1';

let set = new Set();

const { Header,Sider} = Layout;

let playlistSet = {};

let randomArr = [];

for(let i = 0; i < 20;i++){
  randomArr[i] = (Math.random() + 8);
}

class App extends React.Component{
  state = {
    collapsed : false,
    listData:data,
    searching: false,
    showPlaylist: false,
    playlist:[],
    playlistSet:{},
    randomArr:[]
  };

  coponentDidMount(){
    //localStorage.setItem("names", JSON.stringify(names));
    let storedPlaylist = JSON.parse(localStorage.getItem("playlist"));
    let storedPlaylistSet = JSON.parse(localStorage.getItem("playlistSet"));
    if(!storedPlaylist){
      localStorage.setItem("playlist", JSON.stringify([]));
      localStorage.setItem("playlistSet", JSON.stringify({}));
      this.setState({playlist:[],playlistSet:{}});
      return
    }

    this.setState({playlist:storedPlaylist,playlistSet:storedPlaylistSet})

  }

  tweekRecommendation = (set1) => {
    set = set1;
    console.log(set);
  }

  changeFilter = (val) => {
    searchBy = val;
  }

  recommend = async () => {
    this.setState({searching:true});
    if(set.size === 0 ){
      if(!this.state.showPlaylist){
        if(this.state.listData.length != 0){
          if(this.state.showPlaylist && this.state.playlist.length === 0)
            message.error('Select Song from list');
        }
        else{
          message.error('Search and Select Song from list');
        }
        return
      }
    }
    let partStr = ""
    let count = 1;
    let songList = this.state.showPlaylist ? Array.from(this.state.playlistSet) : Array.from(set)
    console.log(songList + 'sdgahjuyfhgc')
    _.forEach(songList, item => {
      partStr = "ent"+count+"="+item+"&"
    })
    
    partStr = partStr.substring(0,partStr.length-1);
    let res = await axios.get('http://0.0.0.0:5000/mrs?recamount=20&'+partStr);

    data = res.data;
    console.log(data)

    let searchList = res.data.recommended_songs

    //_.forOwn(data, function(value, key) {
    //    searchList.push(value)
    // } );

   
    console.log(searchList)


    this.setState({listData:searchList,searching:false,showPlaylist:false});
  }

  search = async (str) => {
    this.setState({searching : true});
    let filter = "artist";
    if(searchBy === "1"){
      filter = "artist";
    }
    else{
      if(searchBy === "2"){
        filter = "title";
      }
      else{
        if(searchBy === "3"){
          filter = "id";
        }
      }
    }
    console.log(str)
    if(!str){
      return
    }
    let res = await axios.get('http://0.0.0.0:5000/songs?'+filter+'='+str);

    data = res.data;
    console.log(data)

    let searchList = []

    _.forOwn(data, function(value, key) {
        searchList.push(value)
     } );

   
    console.log(searchList)

    set = new Set();

    this.setState({listData:searchList,searching:false,showPlaylist:false});

  }

  addToPlaylist = (song) => {
    console.log('adding to playlist');
    let llist = this.state.playlist;
    let lset = this.state.playlistSet;
    llist.push(song)
    lset[song.id] = true;
    this.setState({playlist:llist,playlistSet:lset});
    console.log(this.state.playlist)
    localStorage.setItem("playlist", JSON.stringify(llist));
    localStorage.setItem("playlistSet", JSON.stringify(lset));
  }

  removeFromPlaylist = (song) => {
    let llist = this.state.playlist;
    let lset = this.state.playlistSet;
    for(let i = llist.length-1; i >= 0 ;i--){
      if(llist[i].id === song.id){
        llist.splice(i,1);
        break;
      }
    }
    delete lset[song.id];
    this.setState({playlist:llist,playlistSet:lset});
    localStorage.setItem("playlist", JSON.stringify(llist));
    localStorage.setItem("playlistSet", JSON.stringify(lset));
  }

  showPlaylist = () => {
    this.setState({showPlaylist:true})
  }

  toggle = () => {
    this.setState({
      collapsed : !this.state.collapsed,
    })
  }

  render(){
    return (
        <Row style = {{marginTop:44,maxHeight:-67,height:-67}}>
          <Col span = {5} offset={1} >
             <Search
                    placeholder="input search text"
                    style = {{display:'block',width:234}}
                    onSearch={value => {
                     
                      console.log('searching');
                      //this.search(value)
                      this.search(value);
                    }}
                    style={{ width: 150 , marginLeft:3,color:'white'}}
                  />
            <Sider trigger={null} collapsible collapsed={this.state.collapsed} >
             
                   <List
                    itemLayout="horizontal"
                   >
                      <List.Item>
                        Search By
                      </List.Item>
                  </List>
                  <SelectionArea onMenuChange = {this.changeFilter} />
               
              </Sider>
            
          </Col>
        

          <Col span = {10} style = {{height:'40%'}} offset = {1}>
              <SearchArea randomArr = {randomArr} removeFromPlaylist = {this.removeFromPlaylist} playlistSet = {this.state.playlistSet} addToPlaylist = {this.addToPlaylist} list = {this.state.showPlaylist ? this.state.playlist : this.state.listData} showPlaylist = {this.state.showPlaylist} showPreloader = {this.state.searching} onSelectChanged = {this.tweekRecommendation}  />
          </Col>

          <Col span = {6} offset = {1} >
            <Button type = 'primary' size = 'large' style = {{marginLeft : 123, marginTop:32}} onClick = {this.recommend} > Recommend </Button>
            <Button type = 'primary' size = 'large' style = {{marginLeft : 123, marginTop:32}} onClick = {this.showPlaylist} > Playlist </Button>
          </Col>


        </Row>
      )
  }

}

export default App;
