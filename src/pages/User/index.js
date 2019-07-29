import React, { Component } from 'react';
import { ActivityIndicator, TouchableHighlight } from 'react-native';
import PropTypes from 'prop-types';

import api from '../../services/api';

import {
  Container,
  Header,
  Name,
  Avatar,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: true,
    refreshing: false,
    page: 2,
  };

  async componentDidMount() {
    this.loadIssues();
  }

  loadIssues = async (page = 1) => {
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const { stars } = this.state;

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {
        page,
      },
    });

    this.setState({
      page,
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      refreshing: false,
      loading: false,
    });
  };

  loadMoreIssues = () => {
    const { page } = this.state;

    const nextPage = page + 1;

    this.loadIssues(nextPage);
  };

  refreshStars = async () => {
    this.setState({ refreshing: true });
    this.loadIssues();
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('Repository', { repository });
  };

  render() {
    const { stars, loading, refreshing } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator color="#000" size="large" />
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onRefresh={this.refreshStars}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMoreIssues}
            renderItem={({ item }) => (
              <TouchableHighlight onPress={() => this.handleNavigate(item)}>
                <Starred>
                  <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                  <Info>
                    <Title>{item.name}</Title>
                    <Author>{item.owner.login}</Author>
                  </Info>
                </Starred>
              </TouchableHighlight>
            )}
          />
        )}
      </Container>
    );
  }
}
