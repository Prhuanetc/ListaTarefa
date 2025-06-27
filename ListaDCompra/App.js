import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Svg, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [huePosition, setHuePosition] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#ff9a9a');

  // Converte posição do slider para cor HEX
  const hueToHex = (position) => {
    const h = Math.round((position / 300) * 360);
    const s = 100;
    const l = 80;
    
    const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l / 100 - c / 2;
    
    let r, g, b;
    
    if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0] }
    else if (h < 120) { [r, g, b] = [x, c, 0] }
    else if (h < 180) { [r, g, b] = [0, c, x] }
    else if (h < 240) { [r, g, b] = [0, x, c] }
    else if (h < 300) { [r, g, b] = [x, 0, c] }
    else { [r, g, b] = [c, 0, x] }
    
    const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const addTask = () => {
    if (newTask.trim() === '') {
      Alert.alert('Erro', 'Por favor, digite uma tarefa');
      return;
    }

    if (hours === '' || minutes === '') {
      Alert.alert('Erro', 'Por favor, selecione um horário');
      return;
    }

    const timeString = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    const textColor = getContrastColor(selectedColor);
    
    const task = {
      id: Date.now().toString(),
      text: newTask,
      time: timeString,
      color: selectedColor,
      textColor: textColor,
      completed: false
    };

    setTasks([...tasks, task].sort((a, b) => a.time.localeCompare(b.time)));
    setNewTask('');
    setHours('');
    setMinutes('');
    setShowAddTask(false);
    setShowTimeModal(false);
  };

  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const clearAllTasks = () => {
    if (tasks.length === 0) {
      Alert.alert('Aviso', 'Não há tarefas para limpar');
      return;
    }

    Alert.alert(
      'Limpar tudo',
      'Tem certeza que deseja apagar todas as tarefas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', onPress: () => setTasks([]) }
      ]
    );
  };

  const handleHourChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    let formattedValue = numericValue;
    
    if (numericValue.length > 0) {
      const num = parseInt(numericValue, 10);
      if (num > 23) formattedValue = '23';
    }
    
    setHours(formattedValue);
  };

  const handleMinuteChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    let formattedValue = numericValue;
    
    if (numericValue.length > 0) {
      const num = parseInt(numericValue, 10);
      if (num > 59) formattedValue = '59';
    }
    
    setMinutes(formattedValue);
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho Preto */}
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Tarefas</Text>
        {tasks.length > 0 && (
          <TouchableOpacity onPress={clearAllTasks} style={styles.clearButton}>
            <Text style={styles.clearText}>Limpar tudo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de Tarefas */}
      <ScrollView style={styles.taskList}>
        {tasks.map(task => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskItem, { 
              backgroundColor: task.color,
              borderRadius: 50,
            }]}
            onPress={() => toggleTask(task.id)}
          >
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
              style={[styles.deleteButton, { backgroundColor: 'rgba(255,255,255,0.95)' }]}
            >
              <Icon name="trash" size={18} color={task.color} />
            </TouchableOpacity>
            
            <Text style={[
              styles.taskText, 
              { color: task.textColor },
              task.completed && styles.completedText
            ]}>
              {task.text}
            </Text>
            
            <Text style={[styles.taskTime, { color: task.textColor }]}>
              {task.time}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal de Adicionar Tarefa */}
      {showAddTask && (
        <View style={styles.addTaskContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite a tarefa"
            value={newTask}
            onChangeText={setNewTask}
            placeholderTextColor="#999"
          />
          
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => setShowTimeModal(true)}
          >
            <Icon name="clock" size={16} color="#555" />
            <Text style={styles.timeButtonText}>
              {hours || minutes ? `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}` : 'Selecionar horário'}
            </Text>
          </TouchableOpacity>

          {showTimeModal && (
            <View style={styles.timeModal}>
              <View style={styles.timeModalContent}>
                <Text style={styles.timeModalTitle}>Selecione o horário</Text>
                <View style={styles.timeInputsContainer}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="HH"
                    value={hours}
                    onChangeText={handleHourChange}
                    keyboardType="numeric"
                    maxLength={2}
                    autoFocus={true}
                    placeholderTextColor="#999"
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="MM"
                    value={minutes}
                    onChangeText={handleMinuteChange}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholderTextColor="#999"
                  />
                </View>
                <TouchableOpacity 
                  style={styles.timeConfirmButton}
                  onPress={() => {
                    if (hours && minutes) setShowTimeModal(false);
                    else Alert.alert('Erro', 'Preencha horas e minutos');
                  }}
                >
                  <Text style={styles.timeConfirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Seletor de Cor Personalizado */}
          <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerLabel}>Escolha a cor:</Text>
            <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
            
            <View style={styles.sliderContainer}>
              <Svg height="30" width="100%">
                <Defs>
                  <LinearGradient id="hueSlider" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#FF0000" />
                    <Stop offset="16.67%" stopColor="#FFFF00" />
                    <Stop offset="33.33%" stopColor="#00FF00" />
                    <Stop offset="50%" stopColor="#00FFFF" />
                    <Stop offset="66.67%" stopColor="#0000FF" />
                    <Stop offset="83.33%" stopColor="#FF00FF" />
                    <Stop offset="100%" stopColor="#FF0000" />
                  </LinearGradient>
                </Defs>
                <Rect
                  x="0" y="0" width="100%" height="30"
                  fill="url(#hueSlider)"
                  rx="15" ry="15"
                />
              </Svg>
              
              <View 
                style={[styles.sliderThumb, { left: `${(huePosition / 300) * 100}%` }]}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderMove={(e) => {
                  const newPosition = Math.min(300, Math.max(0, e.nativeEvent.locationX));
                  setHuePosition(newPosition);
                  setSelectedColor(hueToHex(newPosition));
                }}
              />
            </View>
          </View>

          <View style={styles.addTaskButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowAddTask(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addTask}
            >
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Botão de Adicionar */}
      <TouchableOpacity 
        style={styles.addButtonMain}
        onPress={() => setShowAddTask(true)}
      >
        <Icon name="plus" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  clearButton: {
    padding: 8,
  },
  clearText: {
    color: '#FFF',
    fontSize: 16,
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 80,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskText: {
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskTime: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    minWidth: 70,
    textAlign: 'right',
  },
  addTaskContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    fontSize: 18,
    color: '#333',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    marginBottom: 16,
  },
  timeButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
  },
  timeModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  timeModalContent: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    width: '80%',
  },
  timeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  timeInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    width: 80,
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
  },
  timeSeparator: {
    fontSize: 20,
    marginHorizontal: 10,
    color: '#555',
  },
  timeConfirmButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeConfirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  colorPickerContainer: {
    marginBottom: 20,
  },
  colorPickerLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  colorPreview: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  sliderContainer: {
    height: 30,
    justifyContent: 'center',
    marginBottom: 10,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#333',
    position: 'absolute',
    top: 5,
    marginLeft: -10,
  },
  addTaskButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButtonMain: {
    backgroundColor: '#000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    right: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});