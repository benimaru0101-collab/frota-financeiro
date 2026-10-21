import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, ChipSelect } from '../../components/UI';
import { useMotorista } from '../../contexts/MotoristaContext';
import { STATUS, listarVeiculosAtivos, registrarAbastecimento, hojeISO } from '../../lib/motorista';
import { parseValorBR } from '../../utils/money';
import { spacing } from '../../theme/colors';

export default function AbastecerScreen() {
  const { viagens } = useMotorista();
  const [veiculos, setVeiculos] = useState([]);
  const [placa, setPlaca] = useState('');
  const [litros, setLitros] = useState('');
  const [valor, setValor] = useState('');
  const [posto, setPosto] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listarVeiculosAtivos()
      .then((lista) => {
        setVeiculos(lista);
        // Já sugere o veículo da viagem em andamento.
        const atual = viagens.find((v) => v.status === STATUS.EM_ANDAMENTO)?.veiculos?.placa;
        setPlaca(atual || lista[0]?.placa || '');
      })
      .catch((e) => Alert.alert('Erro ao carregar veículos', e?.message ?? ''));
  }, [viagens]);

  async function salvar() {
    const veiculo = veiculos.find((v) => v.placa === placa);
    const nLitros = parseValorBR(litros);
    const nValor = parseValorBR(valor);
    if (!veiculo || nLitros <= 0 || nValor <= 0) {
      Alert.alert('Preencha o veículo, os litros e o valor');
      return;
    }
    setSalvando(true);
    try {
      await registrarAbastecimento({ veiculoId: veiculo.id, litros: nLitros, valor: nValor, posto, dataISO: hojeISO() });
      setLitros('');
      setValor('');
      setPosto('');
      Alert.alert('Abastecimento registrado', `${nLitros} L em ${placa}.`);
    } catch (e) {
      Alert.alert('Não foi possível registrar', e?.message ?? '');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Screen scroll>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Abastecimento</Title>
        <Subtitle>Registre o abastecimento de hoje</Subtitle>
      </View>
      <Label style={styles.label}>Veículo</Label>
      <ChipSelect options={veiculos.map((v) => v.placa)} value={placa} onChange={setPlaca} />
      <Label style={styles.label}>Litros</Label>
      <Input placeholder="Ex.: 320" keyboardType="decimal-pad" value={litros} onChangeText={setLitros} />
      <Label style={styles.label}>Valor (R$)</Label>
      <Input placeholder="Ex.: 2150,00" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
      <Label style={styles.label}>Posto (opcional)</Label>
      <Input placeholder="Nome do posto" value={posto} onChangeText={setPosto} />
      <PrimaryButton title="Registrar abastecimento" onPress={salvar} loading={salvando} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: spacing.md },
});
