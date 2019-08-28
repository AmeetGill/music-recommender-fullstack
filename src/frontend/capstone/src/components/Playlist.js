import React from 'react';
import { Icon,List,Avatar, } from 'antd';
import _ from 'lodash';


let selectedSongsSet = new Set();

class Playlist extends  React.Component{

	componentDidUpdate = () => {
		selectedSongsSet = new Set();
	}

	selectAllSong = (ppp) => {
		// need to use set

		_.forEach(this.props.list, item => {
			selectedSongsSet.add(item.id);
		})

		this.props.onSelectChanged(selectedSongsSet);
		console.log(selectedSongsSet)
	}

	render(){
		return (
				<List
           itemLayout="horizontal"
           bordered = {true}
           dataSource={this.props.list}
           size="small"
           style = {{overflow : 'scroll'}}
           locale = {{emptyText: 'This playlist is empty'}}
           renderItem={item => (
             <List.Item>
               <List.Item.Meta
                 avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                 title={<a href="https://ant.design">{item.title}</a>}
                 description={item.artist}
                 key = {item.id}
               />
               <a onClick = {() => {
               	this.props.removeFromPlaylist(item);
               }}>
               	<Icon type = "logout" />
               </a>
             </List.Item>
           )}
         />
			);
	}
}

export default Playlist;