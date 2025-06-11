import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [showAddTask, setShowAddTask] = useState(false);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [showTimeModal, setShowTimeModal] = useState(false);

  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3',
    '#33FFF3', '#8A2BE2', '#FF6347', '#7CFC00', '#FFD700'
  ];

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

    setTasks([...tasks, task]);
    setNewTask('');
    setHours('');
    setMinutes('');
    setSelectedColor('#ffffff');
    setShowAddTask(false);
    setShowTimeModal(false);
  };

  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
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
    // Verifica se há tarefas
    if (tasks.length === 0) {
      window.alert('Não há tarefas para limpar');
      return;
    }
  
    // Confirmação antes de apagar
    const userConfirmed = window.confirm('Tem certeza que deseja apagar todas as tarefas?');
    
    if (userConfirmed) {
      setTasks([]);
      window.alert('Todas as tarefas foram removidas');
    }
  };

  const handleHourChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    let formattedValue = numericValue;
    
    if (numericValue.length > 0) {
      const num = parseInt(numericValue, 10);
      if (num > 23) {
        formattedValue = '23';
      }
    }
    
    setHours(formattedValue);
  };

  const handleMinuteChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    let formattedValue = numericValue;
    
    if (numericValue.length > 0) {
      const num = parseInt(numericValue, 10);
      if (num > 59) {
        formattedValue = '59';
      }
    }
    
    setMinutes(formattedValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lista de Tarefas</Text>
        <TouchableOpacity 
          onPress={clearAllTasks} 
          style={styles.clearButton}
        >
          <Icon name="trash" size={20} color="#FF5733" />
          <Text style={styles.clearText}>Limpar tudo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.taskList}>
        {tasks.map(task => (
          <View 
            key={task.id} 
            style={[styles.taskItem, { backgroundColor: task.color }]}
          >
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => toggleTask(task.id)}
            >
              <View style={[styles.checkbox, task.completed && styles.checked]}>
                {task.completed && <Icon name="check" size={12} color={task.textColor} />}
              </View>
              <View style={styles.taskTextContainer}>
                <Text style={[styles.taskText, { color: task.textColor }, task.completed && styles.completedText]}>
                  {task.text}
                </Text>
                <Text style={[styles.taskTime, { color: task.textColor }]}>
                  {task.time}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteTask(task.id)}
              style={styles.deleteButton}
            >
              <Icon name="trash" size={16} color={task.textColor} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {showAddTask && (
        <View style={styles.addTaskContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite a tarefa"
            value={newTask}
            onChangeText={setNewTask}
          />
          
          <TouchableOpacity 
            style={styles.timeButton}
            onPress={() => {
              setShowTimeModal(true);
              Keyboard.dismiss();
            }}
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
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="MM"
                    value={minutes}
                    onChangeText={handleMinuteChange}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.timeConfirmButton}
                  onPress={() => {
                    if (hours && minutes) {
                      setShowTimeModal(false);
                    } else {
                      Alert.alert('Erro', 'Preencha horas e minutos');
                    }
                  }}
                >
                  <Text style={styles.timeConfirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.colorPicker}
          >
            {colors.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </ScrollView>

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

      {!showAddTask && (
        <TouchableOpacity 
          style={styles.addButtonMain}
          onPress={() => setShowAddTask(true)}
        >
          <Icon name="plus" size={20} color="white" />
          <Text style={styles.addButtonMainText}>Adicionar Tarefa</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearText: {
    marginLeft: 5,
    color: '#FF5733',
    fontSize: 16,
  },
  taskList: {
    flex: 1,
    marginBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    marginBottom: 3,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskTime: {
    fontSize: 12,
    opacity: 0.8,
  },
  deleteButton: {
    padding: 8,
  },
  addTaskContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 15,
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
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  timeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  timeInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    width: 60,
    textAlign: 'center',
    fontSize: 18,
  },
  timeSeparator: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  timeConfirmButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeConfirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  colorPicker: {
    marginBottom: 15,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
  },
  addTaskButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButtonMain: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonMainText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
});