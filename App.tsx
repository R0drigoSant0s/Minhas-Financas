import React, { useState, useEffect } from 'react';
import { PlusCircle, Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle, DollarSign, Target, Trash2, Settings, Sun, Moon, ArrowLeft } from 'lucide-react';

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'investment';
  date: string;
  budgetId?: string;
};

type Budget = {
  id: string;
  name: string;
  amount: number;
  spent: number;
};

function App() {
  const [currentView, setCurrentView] = useState<'transactions' | 'budgets' | 'settings'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'investment'>('income');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [previousView, setPreviousView] = useState<'transactions' | 'budgets'>('transactions');

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleViewChange = (view: 'transactions' | 'budgets' | 'settings') => {
    if (view === 'settings') {
      setPreviousView(currentView === 'settings' ? 'transactions' : currentView);
    }
    setCurrentView(view);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString().split('T')[0],
      budgetId: type === 'expense' ? selectedBudgetId : undefined,
    };

    if (type === 'expense' && selectedBudgetId) {
      setBudgets(budgets.map(budget => 
        budget.id === selectedBudgetId
          ? { ...budget, spent: budget.spent + parseFloat(amount) }
          : budget
      ));
    }

    setTransactions([...transactions, newTransaction]);
    setDescription('');
    setAmount('');
    setSelectedBudgetId('');
  };

  const handleDeleteTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction?.type === 'expense' && transaction.budgetId) {
      setBudgets(budgets.map(budget =>
        budget.id === transaction.budgetId
          ? { ...budget, spent: budget.spent - transaction.amount }
          : budget
      ));
    }
    setTransactions(transactions.filter(t => t.id !== transactionId));
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget: Budget = {
      id: Math.random().toString(36).substr(2, 9),
      name: newBudgetName,
      amount: parseFloat(newBudgetAmount),
      spent: 0,
    };
    setBudgets([...budgets, newBudget]);
    setNewBudgetName('');
    setNewBudgetAmount('');
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets(budgets.filter(budget => budget.id !== budgetId));
    setTransactions(transactions.map(transaction => 
      transaction.budgetId === budgetId 
        ? { ...transaction, budgetId: undefined }
        : transaction
    ));
  };

  const getTotal = (type: 'income' | 'expense' | 'investment') => {
    return transactions
      .filter((t) => t.type === type)
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const currentBalance = getTotal('income') - getTotal('expense') - getTotal('investment');

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
            <Wallet className="w-8 h-8" />
            Minhas Finanças
          </h1>
          <button
            onClick={() => handleViewChange('settings')}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <Settings className={darkMode ? 'text-white' : 'text-gray-800'} />
          </button>
        </div>

        {currentView !== 'settings' && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => handleViewChange('transactions')}
              className={`flex-1 py-2 px-4 rounded-md ${
                currentView === 'transactions'
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              Transações
            </button>
            <button
              onClick={() => handleViewChange('budgets')}
              className={`flex-1 py-2 px-4 rounded-md ${
                currentView === 'budgets'
                  ? 'bg-blue-600 text-white'
                  : darkMode
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              Orçamentos
            </button>
          </div>
        )}

        {currentView === 'settings' ? (
          <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-gray-100'} border`}>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => handleViewChange(previousView)}
                className={`p-2 rounded-full ${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-800 hover:bg-gray-100'}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Configurações</h2>
            </div>
            <div className="flex items-center justify-between">
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Modo Escuro</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        ) : currentView === 'transactions' ? (
          <>
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-gray-100'} border mb-8`}>
              <div className="flex items-center gap-2 text-gray-800 dark:text-white mb-2">
                <DollarSign className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Saldo Atual</h2>
              </div>
              <p className={`text-3xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {currentBalance.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-gray-100'} border`}>
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <ArrowUpCircle className="w-5 h-5" />
                  <h2 className="font-semibold">Receitas</h2>
                </div>
                <p className="text-2xl font-bold text-green-600">R$ {getTotal('income').toFixed(2)}</p>
              </div>

              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-gray-100'} border`}>
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <ArrowDownCircle className="w-5 h-5" />
                  <h2 className="font-semibold">Despesas</h2>
                </div>
                <p className="text-2xl font-bold text-red-600">R$ {getTotal('expense').toFixed(2)}</p>
              </div>

              <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-gray-100'} border`}>
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <h2 className="font-semibold">Investimentos</h2>
                </div>
                <p className="text-2xl font-bold text-blue-600">R$ {getTotal('investment').toFixed(2)}</p>
              </div>
            </div>

            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-gray-100'} border mb-8`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Nova Transação</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full p-2 rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    } border`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full p-2 rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    } border`}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Tipo
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'income' | 'expense' | 'investment')}
                    className={`w-full p-2 rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    } border`}
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                    <option value="investment">Investimento</option>
                  </select>
                </div>
                {type === 'expense' && budgets.length > 0 && (
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                      Orçamento (opcional)
                    </label>
                    <select
                      value={selectedBudgetId}
                      onChange={(e) => setSelectedBudgetId(e.target.value)}
                      className={`w-full p-2 rounded-md ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'border-gray-300 text-gray-900'
                      } border`}
                    >
                      <option value="">Selecione um orçamento</option>
                      {budgets.map(budget => (
                        <option key={budget.id} value={budget.id}>
                          {budget.name} (R$ {(budget.amount - budget.spent).toFixed(2)} disponível)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Adicionar Transação
                </button>
              </form>
            </div>

            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-gray-100'} border`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Histórico de Transações</h2>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhuma transação registrada
                  </p>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-4 rounded-md ${
                        darkMode ? 'border-gray-700' : 'border-gray-100'
                      } border`}
                    >
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {transaction.description}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {transaction.date}
                        </p>
                        {transaction.budgetId && (
                          <p className="text-sm text-blue-600">
                            {budgets.find(b => b.id === transaction.budgetId)?.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' :
                          transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          R$ {transaction.amount.toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-gray-100'} border`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Novo Orçamento</h2>
              <form onSubmit={handleCreateBudget} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Nome do Orçamento
                  </label>
                  <input
                    type="text"
                    value={newBudgetName}
                    onChange={(e) => setNewBudgetName(e.target.value)}
                    className={`w-full p-2 rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    } border`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Valor Limite (R$)
                  </label>
                  <input
                    type="number"
                    value={newBudgetAmount}
                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                    className={`w-full p-2 rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    } border`}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Target className="w-5 h-5" />
                  Criar Orçamento
                </button>
              </form>
            </div>

            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-gray-100'} border`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Orçamentos Ativos</h2>
              <div className="space-y-4">
                {budgets.length === 0 ? (
                  <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nenhum orçamento criado
                  </p>
                ) : (
                  budgets.map((budget) => (
                    <div
                      key={budget.id}
                      className={`p-4 rounded-md ${darkMode ? 'border-gray-700' : 'border-gray-100'} border space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {budget.name}
                        </h3>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Excluir
                        </button>
                      </div>
                      <div className="space-y-1">
                        <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span>Orçamento:</span>
                          <span className="font-medium">R$ {budget.amount.toFixed(2)}</span>
                        </div>
                        <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span>Utilizado:</span>
                          <span className="font-medium">R$ {budget.spent.toFixed(2)}</span>
                        </div>
                        <div className={`flex justify-between text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span>Disponível:</span>
                          <span className={`font-medium ${
                            budget.amount - budget.spent > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            R$ {(budget.amount - budget.spent).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            (budget.spent / budget.amount) > 1 ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;