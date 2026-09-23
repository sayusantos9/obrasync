import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { SearchBar } from '../components/common/SearchBar';
import { Content, Screen, Scroll } from '../components/ui/primitives';
import { materials } from '../data/mockData';
import {
  Caption,
  Count,
  Header,
  ListHeader,
  MaterialCard,
  MaterialCode,
  MaterialIcon,
  MaterialInfo,
  MaterialMeta,
  MaterialName,
  Title,
  Variation,
} from './MaterialsScreen.styles';

const MATERIAL_BACKGROUNDS = ['#FFF4D6', '#EDE6F1', '#E5F5EF', '#F3EAF6'];

function getVariationStyle(variation, index) {
  if (variation > 5) {
    return { color: '#B5473E', backgroundColor: '#FBE9E7' };
  }

  return {
    color: variation > 0 ? '#E0A526' : '#2F9E7A',
    backgroundColor: MATERIAL_BACKGROUNDS[index % MATERIAL_BACKGROUNDS.length],
  };
}

export function MaterialsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const visibleMaterials = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return materials;

    return materials.filter((material) => (
      `${material.code} ${material.name}`.toLowerCase().includes(normalizedQuery)
    ));
  }, [searchQuery]);

  return (
    <Screen>
      <Scroll>
        <Header>
          <Title>Materiais</Title>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Código ou descrição"
          />
        </Header>

        <Content>
          <ListHeader>
            <Count>{visibleMaterials.length} insumos</Count>
            <Caption>Consulta de insumos</Caption>
          </ListHeader>

          {visibleMaterials.map((material, index) => {
            const variationStyle = getVariationStyle(material.variation, index);

            return (
              <MaterialCard key={material.id}>
                <MaterialIcon $backgroundColor={variationStyle.backgroundColor}>
                  <Ionicons
                    name="cube-outline"
                    size={24}
                    color={variationStyle.color}
                  />
                </MaterialIcon>
                <MaterialInfo>
                  <MaterialCode>{material.code}</MaterialCode>
                  <MaterialName>{material.name}</MaterialName>
                  <MaterialMeta>
                    {material.purchased} de {material.planned} {material.unit}
                  </MaterialMeta>
                </MaterialInfo>
                <Variation $color={variationStyle.color}>
                  {material.variation > 0 ? '+' : ''}{material.variation}%
                </Variation>
              </MaterialCard>
            );
          })}
        </Content>
      </Scroll>
    </Screen>
  );
}
