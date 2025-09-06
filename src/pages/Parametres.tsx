import React, { useState } from 'react';
import { Download, Upload, Database, Info, Shield, Smartphone } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Modal, ConfirmModal } from '../components/UI/Modal';
import { useStorage } from '../hooks/useStorage';
import { useToast } from '../hooks/useToast';

export function Parametres() {
  const { exportData, importData, clearAllData, getStorageInfo } = useStorage();
  const { showToast } = useToast();
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const storageInfo = getStorageInfo();

  const handleExportData = () => {
    try {
      exportData();
      showToast('Données exportées avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'export des données', 'error');
    }
  };

  const handleImportData = async () => {
    if (!importFile) return;

    setLoading(true);
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      
      const result = await importData(data);
      if (result.success) {
        showToast('Données importées avec succès', 'success');
        setShowImportModal(false);
        setImportFile(null);
        // Recharger la page pour refléter les nouvelles données
        window.location.reload();
      } else {
        showToast(result.error || 'Erreur lors de l\'import', 'error');
      }
    } catch (error) {
      showToast('Fichier JSON invalide', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    setLoading(true);
    try {
      await clearAllData();
      showToast('Toutes les données ont été supprimées', 'success');
      setShowClearModal(false);
      // Recharger la page
      window.location.reload();
    } catch (error) {
      showToast('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
    } else {
      showToast('Veuillez sélectionner un fichier JSON valide', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">
          Gérez les paramètres et données de l'application
        </p>
      </div>

      {/* Sauvegarde et restauration */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sauvegarde et restauration</h2>
              <p className="text-sm text-gray-600">
                Exportez ou importez toutes vos données
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Exporter les données</h3>
              <p className="text-sm text-gray-600">
                Téléchargez un fichier JSON contenant toutes vos données (membres, commissions, PV).
              </p>
              <Button
                variant="primary"
                icon={<Download />}
                onClick={handleExportData}
              >
                Exporter en JSON
              </Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Importer les données</h3>
              <p className="text-sm text-gray-600">
                Restaurez vos données à partir d'un fichier JSON d'export.
              </p>
              <Button
                variant="secondary"
                icon={<Upload />}
                onClick={() => setShowImportModal(true)}
              >
                Importer depuis JSON
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">Zone dangereuse</h3>
              <p className="text-sm text-red-700 mb-3">
                Cette action supprimera définitivement toutes les données de l'application.
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowClearModal(true)}
              >
                Supprimer toutes les données
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de stockage */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Info className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Informations de stockage</h2>
              <p className="text-sm text-gray-600">
                État actuel des données stockées localement
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{storageInfo.membres}</div>
              <div className="text-sm text-gray-600">Membres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{storageInfo.commissions}</div>
              <div className="text-sm text-gray-600">Commissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{storageInfo.pv}</div>
              <div className="text-sm text-gray-600">Procès-verbaux</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p><strong>Stockage :</strong> LocalStorage (navigateur)</p>
              <p><strong>Dernière sauvegarde :</strong> {storageInfo.lastBackup || 'Jamais'}</p>
              <p><strong>Taille approximative :</strong> {storageInfo.size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PWA et installation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Application mobile</h2>
              <p className="text-sm text-gray-600">
                Installez l'application sur votre téléphone
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Installation sur mobile</h3>
              <p className="text-sm text-gray-600 mb-4">
                Cette application peut être installée sur votre téléphone comme une application native.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Instructions d'installation :</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Sur Android (Chrome) :</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Appuyez sur le menu (3 points) en haut à droite</li>
                    <li>Sélectionnez "Ajouter à l'écran d'accueil"</li>
                    <li>Confirmez l'installation</li>
                  </ul>
                  
                  <p className="pt-2"><strong>Sur iPhone (Safari) :</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Appuyez sur le bouton de partage (carré avec flèche)</li>
                    <li>Sélectionnez "Sur l'écran d'accueil"</li>
                    <li>Confirmez l'ajout</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations sur l'application */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">À propos</h2>
              <p className="text-sm text-gray-600">
                Informations sur l'application AJCDC - Gestion
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">AJCDC - Gestion</h3>
              <p className="text-sm text-gray-600">Version 1.0.0</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Association des Jeunes de la Cité CDC de Bambilor</h4>
              <p className="text-sm text-gray-600">
                Application de gestion développée pour faciliter l'administration de l'association.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fonctionnalités</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gestion des membres et de leur statut</li>
                <li>• Organisation des commissions et affectations</li>
                <li>• Rédaction et archivage des procès-verbaux</li>
                <li>• Exports Excel et PDF professionnels</li>
                <li>• Fonctionnement offline (sans internet)</li>
                <li>• Installation possible sur mobile (PWA)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sécurité et confidentialité</h4>
              <p className="text-sm text-gray-600">
                Toutes les données sont stockées localement sur votre appareil. 
                Aucune information n'est transmise vers des serveurs externes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'import */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportFile(null);
        }}
        title="Importer les données"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Attention :</strong> L'import remplacera toutes les données actuelles. 
              Assurez-vous d'avoir fait une sauvegarde avant de continuer.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner le fichier JSON
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-600"
            />
          </div>
          
          {importFile && (
            <div className="text-sm text-gray-600">
              <p>Fichier sélectionné : <strong>{importFile.name}</strong></p>
              <p>Taille : {(importFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleImportData}
              disabled={!importFile}
              loading={loading}
            >
              Importer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearData}
        title="Supprimer toutes les données"
        message="Êtes-vous absolument sûr de vouloir supprimer toutes les données ? Cette action est irréversible et supprimera tous les membres, commissions et procès-verbaux."
        confirmText="Supprimer tout"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
