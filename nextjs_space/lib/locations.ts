
// Dados de localização para o sistema de vagas

export const countries = [
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'UK', name: 'Reino Unido' },
  { code: 'CA', name: 'Canadá' },
  { code: 'PT', name: 'Portugal' },
  { code: 'ES', name: 'Espanha' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'FR', name: 'França' },
  { code: 'IT', name: 'Itália' },
  { code: 'AR', name: 'Argentina' },
  { code: 'MX', name: 'México' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'PE', name: 'Peru' },
  { code: 'UY', name: 'Uruguai' }
];

export const brazilianStates = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' }
];

// Cidades principais do Brasil por estado
export const brazilianCities: Record<string, string[]> = {
  'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
  'AL': ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo'],
  'AP': ['Macapá', 'Santana', 'Laranjal do Jari'],
  'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru'],
  'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas'],
  'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape'],
  'DF': ['Brasília', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Planaltina', 'Águas Claras', 'Gama'],
  'ES': ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'Colatina'],
  'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás'],
  'MA': ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias', 'Codó', 'Paço do Lumiar'],
  'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra', 'Cáceres'],
  'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã', 'Aquidauana'],
  'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Santa Luzia', 'Sete Lagoas', 'Divinópolis', 'Ibirité', 'Poços de Caldas'],
  'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal', 'Parauapebas', 'Itaituba'],
  'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa'],
  'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá', 'Araucária', 'Toledo', 'Apucarana'],
  'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'],
  'PI': ['Teresina', 'Parnaíba', 'Picos', 'Floriano', 'Piripiri'],
  'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda', 'Magé', 'Itaboraí', 'Macaé', 'Cabo Frio', 'Nova Friburgo', 'Barra Mansa', 'Angra dos Reis', 'Teresópolis'],
  'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba', 'Ceará-Mirim'],
  'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande', 'Alvorada', 'Passo Fundo', 'Sapucaia do Sul', 'Uruguaiana', 'Santa Cruz do Sul'],
  'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Cacoal', 'Vilhena'],
  'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí'],
  'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Jaraguá do Sul', 'Lages', 'Palhoça', 'Balneário Camboriú', 'Brusque', 'Tubarão', 'São Bento do Sul'],
  'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'São José dos Campos', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 'São José do Rio Preto', 'Santos', 'Mogi das Cruzes', 'Diadema', 'Jundiaí', 'Carapicuíba', 'Piracicaba', 'Bauru', 'Itaquaquecetuba', 'São Vicente', 'Franca', 'Guarujá', 'Taubaté', 'Praia Grande', 'Limeira', 'Suzano', 'Taboão da Serra', 'Sumaré', 'Barueri', 'Embu das Artes', 'São Carlos', 'Marília', 'Indaiatuba', 'Cotia', 'Americana', 'Jacareí', 'Araraquara', 'Hortolândia', 'Presidente Prudente', 'Itapevi'],
  'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'Estância'],
  'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional']
};

// Estados de outros países (simplificado)
export const internationalStates: Record<string, string[]> = {
  'US': ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan'],
  'UK': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'CA': ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan'],
  'PT': ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Setúbal'],
  'ES': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga'],
  'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart'],
  'FR': ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine'],
  'IT': ['Lazio', 'Lombardia', 'Campania', 'Sicilia', 'Veneto', 'Piemonte'],
  'AR': ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán'],
  'MX': ['Ciudad de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Guanajuato'],
  'CL': ['Santiago', 'Valparaíso', 'Concepción', 'La Serena'],
  'CO': ['Bogotá', 'Antioquia', 'Valle del Cauca', 'Atlántico'],
  'PE': ['Lima', 'Arequipa', 'Cusco', 'Trujillo'],
  'UY': ['Montevideo', 'Canelones', 'Maldonado', 'Salto']
};

// Cidades de outros países (simplificado - principais cidades)
export const internationalCities: Record<string, Record<string, string[]>> = {
  'US': {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'],
    'Texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
    'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
    'Illinois': ['Chicago', 'Aurora', 'Naperville'],
    'Pennsylvania': ['Philadelphia', 'Pittsburgh'],
    'Ohio': ['Columbus', 'Cleveland', 'Cincinnati'],
    'Georgia': ['Atlanta', 'Augusta', 'Savannah'],
    'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro'],
    'Michigan': ['Detroit', 'Grand Rapids', 'Warren']
  },
  'UK': {
    'England': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Newcastle'],
    'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen'],
    'Wales': ['Cardiff', 'Swansea'],
    'Northern Ireland': ['Belfast', 'Derry']
  },
  'CA': {
    'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey'],
    'Alberta': ['Calgary', 'Edmonton'],
    'Manitoba': ['Winnipeg'],
    'Saskatchewan': ['Saskatoon', 'Regina']
  },
  'PT': {
    'Lisboa': ['Lisboa', 'Amadora', 'Cascais'],
    'Porto': ['Porto', 'Vila Nova de Gaia', 'Matosinhos'],
    'Braga': ['Braga', 'Guimarães'],
    'Coimbra': ['Coimbra', 'Figueira da Foz'],
    'Faro': ['Faro', 'Portimão', 'Albufeira'],
    'Setúbal': ['Setúbal', 'Almada', 'Barreiro']
  }
};

export function getStates(countryCode: string): { code: string; name: string }[] {
  if (countryCode === 'BR') {
    return brazilianStates;
  } else if (internationalStates[countryCode]) {
    return internationalStates[countryCode].map((state: string) => ({ code: state, name: state }));
  }
  return [];
}

export function getCities(countryCode: string, stateCode: string): string[] {
  if (countryCode === 'BR') {
    return brazilianCities[stateCode] || [];
  } else if (internationalCities[countryCode] && internationalCities[countryCode][stateCode]) {
    return internationalCities[countryCode][stateCode];
  }
  return [];
}
