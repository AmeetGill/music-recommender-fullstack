import React from 'react';
import { Icon,List,Avatar,Progress, Tooltip } from 'antd';
import { Checkbox } from 'antd';
import Playlist from './Playlist.js';
import preloader from '../images/preloader.gif';

let selectedSongsSet = new Set();

class SearchArea extends  React.Component{

	componentDidUpdate = () => {
		selectedSongsSet = new Set();
	}

	selectSong = (ppp) => {
		// need to use set
		console.log('changed bro',ppp)
		if(selectedSongsSet.has(ppp.target.id) ){
			selectedSongsSet.delete(ppp.target.id);
		}
		else{
			selectedSongsSet.add(ppp.target.id);
		}
		this.props.onSelectChanged(selectedSongsSet);
		console.log(selectedSongsSet)
	}

	render(){
		let i = 0;
		if(this.props.showPreloader){
			return (
				<img src = {preloader} style = {{marginLeft : -73}} />
				)
		}
		if(this.props.showPlaylist){
			return (
				<Playlist list = {this.props.list} removeFromPlaylist = {this.props.removeFromPlaylist} />
			);
		}
		return (
				<List
                 itemLayout="horizontal"
                 bordered = {true}
                 dataSource={this.props.list}
                 size="small"
                 style = {{overflow : 'scroll'}}
                 locale = {{emptyText: 'Search Songs'}}
                 renderItem={item => (
                   <List.Item>
                   	<Checkbox id = {item.id} onChange = {this.selectSong} />
                     <List.Item.Meta
                       avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                       title={<a href="https://ant.design">{item.title}</a>}
                       description={item.artist}
                       key = {item.id}
                     />
                     {item.points ? 
                      <Tooltip title="Similarity with selected songs">
					      <Progress percent={Math.round(item.points*this.props.randomArr[i++])} successPercent={70} type="circle" />
					    </Tooltip>
                        :
                        undefined
                    }
                    {this.props.playlistSet[item.id] ?
                    	<Icon type = "check-circle" style = {{marginLeft:23}} />
                    	:
	                    <a onClick = {() => {
	                    	this.props.addToPlaylist(item);
	                    }} >
	                    	<Icon type = "plus-circle" style = {{marginLeft:23}} />
	                    </a>
	                }
                   </List.Item>
                 )}
               />
			);
	}
}

export default SearchArea;